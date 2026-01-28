export class AppInfo {
  id: string;
  version: string;
}

export class InstallationInfo {
  installation_id: string;
  org_id: string;
  ones_base_url: string;
  shared_secret: string;
  callback_type: string;
  time_stamp: number;
  app?: AppInfo;
}

export class InstallCallbackResp {
  installation_id: string;
  time_stamp: number;
}

export class LifecycleCallbackReq {
  installation_id: string;
  callback_type: string;
  time_stamp: number;
  app?: AppInfo;
}

export class JWTClaims {
  iss: string; // Issuer (ones_base_url)
  sub: string; // Subject (installation_id)
  aud: string; // Audience (app_id)
  exp: number; // Expiration time
  iat: number; // Issued at time
  uid: string; // User ID
}

export class JWTAssertionClaim {
  uid: string; // User ID
  rsh: string; // Request hash
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  jti: string; // JWT ID
}

export class ONESEventAppV2 {
  eventID: string;
  eventType: string;
  eventData: any;
  timestamp: number;
  subscriberID: string;
}

export class ManhourOptions {
  scene: string;
}

export class ManhourRequest {
  type: string; // Estimated, registered, remaining work hours classification
  action: string; // add, update, delete
  mode: string;
  options: ManhourOptions;
}

export class Entry {
  title: string; // Setting item title
  page_url: string; // Setting item page link
}

export class SettingPageEntryRequest {
  user_uuid: string; // User UUID
  language: string; // Language
  timezone: string; // Timezone
}

export class SettingPageEntriesResponse {
  entries: Entry[];
}

import { Request } from 'express';

// Extended Request interface with middleware-added properties
export interface AuthenticatedRequest extends Request {
  installation_id: string;
  uid: string;
  ones_url: string;
}
