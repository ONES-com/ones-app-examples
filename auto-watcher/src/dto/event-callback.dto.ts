export class IssueCreatedEventData {
  organizationID?: string;
  teamID?: string;
  triggerUserID?: string;
  issueID: string;
  statusID: string;
  scopeID: string;
}

export class IssueCreatedEventCallback {
  eventID: string;
  eventType: string;
  timestamp: number;
  subscriberID: string;
  eventData: IssueCreatedEventData;
}
