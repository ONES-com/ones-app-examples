import {
  Controller,
  Get,
  Post,
  Put,
  Res,
  Body,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import type { Response } from 'express';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { OpenApiService } from './services/openapi.service';
import { AuthService } from './services/auth.service';
import { WatcherRuleService } from './services/watcher-rule.service';
import { IssueWatcherService } from './services/issue-watcher.service';
import {
  InstallationInfo,
  InstallCallbackResp,
  LifecycleCallbackReq,
  SettingPageEntryRequest,
  SettingPageEntriesResponse,
} from './dto/install-callback.dto';
import { WatcherRuleDto, WatcherRuleInput } from './dto/watcher-rule.dto';
import { IssueCreatedEventCallback } from './dto/event-callback.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly openapiService: OpenApiService,
    private readonly authService: AuthService,
    private readonly watcherRuleService: WatcherRuleService,
    private readonly issueWatcherService: IssueWatcherService,
  ) {}

  @Get()
  getManifest(@Res() res: Response) {
    try {
      const manifestPath = join(process.cwd(), 'manifest.json');
      const manifestData = readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestData) as {
        id: string;
        [key: string]: any;
      };

      // Validate required fields
      if (!manifest.id) {
        throw new Error('Missing required field: id');
      }
      manifest.base_url = process.env.BASE_URL;

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(manifest, null, 2));
    } catch (error) {
      this.logger.error(
        `Failed to read manifest file: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new HttpException(
        'Failed to read manifest file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('install_cb')
  async installCallback(
    @Body() requestBody: InstallationInfo,
    @Res() res: Response,
  ) {
    this.logger.log(
      `receive install callback installation id: ${requestBody.installation_id}`,
    );

    try {
      await this.databaseService.saveInstallCallback(requestBody);
      this.logger.log(
        `save install callback info success: ${requestBody.installation_id}`,
      );

      const response: InstallCallbackResp = {
        installation_id: requestBody.installation_id,
        time_stamp: Math.floor(Date.now() / 1000),
      };

      this.logger.log(
        `send install callback response: ${JSON.stringify(response)}`,
      );
      res.status(HttpStatus.OK).send(response);
    } catch (error) {
      this.logger.error(
        `install callback failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new HttpException(
        `save install callback info failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/enabled_cb')
  async handleEnabledCB(
    @Body() requestBody: LifecycleCallbackReq,
    @Res() res: Response,
  ) {
    const installationID = requestBody.installation_id;
    const installInfo =
      await this.databaseService.getInstallation(installationID);

    this.logger.log(
      `receive enabled callback installation id: ${requestBody.installation_id}`,
    );

    try {
      const body = await this.openapiService.callONESOpenAPI(
        installInfo,
        '',
        '/openapi/v2/account/teams',
        'GET',
        null,
      );
      this.logger.log(`organization enabled, teams: ${JSON.stringify(body)}`);
    } catch (error) {
      throw new HttpException(
        `enabled callback failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    res.status(HttpStatus.OK).send({ status: 'success', message: 'ok' });
  }

  @Post('/settingPage/entries')
  handleSettingPageEntries(@Body() requestBody: SettingPageEntryRequest) {
    this.logger.log(
      `handle user custom entries, info: ${JSON.stringify(requestBody)}`,
    );

    const returnEntries: SettingPageEntriesResponse = {
      entries: [
        {
          title: 'Rule settings',
          page_url: '/static/settings-page.html',
        },
      ],
    };

    return returnEntries;
  }

  @Get('/settings/watcher-rule')
  async getWatcherRule(
    @Headers('authorization') authorization?: string,
  ): Promise<WatcherRuleDto> {
    try {
      await this.authService.validateAppRequest(authorization ?? '');
    } catch (error) {
      throw new HttpException(
        `Unauthorized: ${error instanceof Error ? error.message : 'unknown error'}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const rule = await this.watcherRuleService.getActiveRule();
    if (!rule) {
      return {
        id: '',
        projectId: '',
        teamId: '',
        watcherUserIds: [],
        active: false,
        createdBy: '',
        createdAt: '',
        updatedAt: '',
      };
    }

    return {
      id: rule.id,
      projectId: rule.projectId,
      teamId: rule.teamId,
      watcherUserIds: rule.watcherUserIds ?? [],
      active: rule.active,
      createdBy: rule.createdBy,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }

  @Put('/settings/watcher-rule')
  async saveWatcherRule(
    @Headers('authorization') authorization: string,
    @Body() requestBody: WatcherRuleInput,
  ): Promise<WatcherRuleDto> {
    try {
      await this.authService.validateAppRequest(authorization ?? '');
    } catch (error) {
      throw new HttpException(
        `Unauthorized: ${error instanceof Error ? error.message : 'unknown error'}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const saved = await this.watcherRuleService.saveRule(requestBody);
    return {
      id: saved.id,
      projectId: saved.projectId,
      teamId: saved.teamId,
      watcherUserIds: saved.watcherUserIds ?? [],
      active: saved.active,
      createdBy: saved.createdBy,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  @Post('/event_cb')
  @HttpCode(HttpStatus.OK)
  async handleEventCallback(@Body() requestBody: IssueCreatedEventCallback) {
    return this.issueWatcherService.handleIssueCreated(requestBody);
  }
}
