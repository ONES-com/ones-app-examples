export class AddIssueWatchersRequest {
  watchers: string[];
}

export interface IssueDetailsResponse {
  project?: {
    id?: string;
    name?: string;
  };
  data?: {
    project?: {
      id?: string;
      name?: string;
    };
  };
}
