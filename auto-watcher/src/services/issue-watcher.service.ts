import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { OpenApiService } from './openapi.service';
import { WatcherRuleService } from './watcher-rule.service';
import { IssueCreatedEventCallback } from '../dto/event-callback.dto';
import {
  AddIssueWatchersRequest,
  IssueDetailsResponse,
} from '../dto/openapi.dto';

@Injectable()
export class IssueWatcherService {
  private readonly logger = new Logger(IssueWatcherService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly openApiService: OpenApiService,
    private readonly watcherRuleService: WatcherRuleService,
  ) {}

  async handleIssueCreated(event: IssueCreatedEventCallback) {
    this.logger.log(
      `Issue created event received: ${event.eventID} type=${event.eventType}`,
    );

    if (event.eventType !== 'ones:project:issue:created') {
      this.logger.warn(`Unsupported event type: ${event.eventType}`);
      return { status: 'ignored', reason: 'unsupported_event' };
    }

    const rule = await this.watcherRuleService.getActiveRule();
    if (!rule) {
      this.logger.log('No active watcher rule found; skipping event.');
      return { status: 'ignored', reason: 'no_rule' };
    }

    const installationInfo = await this.databaseService.getInstallation(
      event.subscriberID,
    );
    if (!installationInfo) {
      this.logger.error(
        `Installation not found for subscriber: ${event.subscriberID}`,
      );
      return { status: 'failed', reason: 'missing_installation' };
    }

    const teamId = event.eventData.teamID || rule.teamId;
    const triggerUserId = event.eventData.triggerUserID ?? '';
    if (!teamId) {
      this.logger.error('Missing team ID for event processing.');
      return { status: 'failed', reason: 'missing_team' };
    }

    const issueId = event.eventData.issueID;
    if (!issueId) {
      this.logger.warn('Missing issue ID in event data; skipping event.');
      return { status: 'ignored', reason: 'missing_issue' };
    }

    let projectId = '';
    let projectName = '';

    try {
      const details = (await this.openApiService.callONESOpenAPI(
        installationInfo,
        triggerUserId,
        `/openapi/v2/project/issues/${issueId}?teamID=${teamId}`,
        'GET',
      )) as IssueDetailsResponse;

      const project = details.project ?? details.data?.project;
      projectId = project?.id;
      projectName = project?.name;

      if (!projectId) {
        this.logger.log(
          `Project lookup returned no project for issue ${issueId}.`,
        );
        return { status: 'ignored', reason: 'missing_project' };
      }

      this.logger.log(
        `Resolved project for issue ${issueId}: ${projectId}${
          projectName ? ` (${projectName})` : ''
        }`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to lookup project for issue ${issueId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return { status: 'ignored', reason: 'lookup_failed' };
    }

    if (rule.projectId !== projectId) {
      this.logger.log(
        `Rule not applicable for project: ${projectId ?? 'missing'}`,
      );
      return { status: 'ignored', reason: 'project_mismatch' };
    }

    if (!rule.watcherUserIds || rule.watcherUserIds.length === 0) {
      this.logger.log('Watcher rule has no users; skipping event.');
      return { status: 'ignored', reason: 'empty_watchers' };
    }
    const payload: AddIssueWatchersRequest = {
      watchers: rule.watcherUserIds,
    };

    try {
      await this.openApiService.callONESOpenAPI(
        installationInfo,
        '',
        `/openapi/v2/project/issues/${issueId}/watchers?teamID=${teamId}`,
        'POST',
        payload,
      );
      this.logger.log(
        `Added watchers to issue ${issueId}: ${rule.watcherUserIds.join(', ')}`,
      );
      return { status: 'processed' };
    } catch (error) {
      this.logger.error(
        `Failed to add watchers for issue ${issueId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return { status: 'failed', reason: 'openapi_error' };
    }
  }
}
