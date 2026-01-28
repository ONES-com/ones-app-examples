export class WatcherRuleInput {
  projectId: string;
  teamId: string;
  watcherUserIds: string[];
}

export class WatcherRuleDto extends WatcherRuleInput {
  id: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
