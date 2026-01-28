import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InstallationInfo } from '../dto/install-callback.dto';

interface TokenResponse {
  access_token: string;
  token_type: string;
  email: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  user_id: string;
}

@Injectable()
export class OpenApiService {
  constructor(private authService: AuthService) {}

  private async getAccessToken(
    installationInfo: InstallationInfo,
    userID: string,
  ): Promise<string> {
    const tokenString = this.authService.genOAuthJWTAssertion(
      installationInfo,
      userID,
    );

    const onesUrl = new URL(installationInfo.ones_base_url);
    const tokenUrl = new URL('/oauth2/token', onesUrl);

    const formData = new URLSearchParams();
    formData.set(
      'grant_type',
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    );
    formData.set('client_id', installationInfo.installation_id);
    formData.set('assertion', tokenString);

    const response = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(
        `Failed to get ONES OpenAPI access token: ${response.statusText}, response: ${await response.text()}`,
      );
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const token = (await response.json()) as TokenResponse;
    return token.access_token;
  }

  async callONESOpenAPI(
    installationInfo: InstallationInfo,
    userID: string,
    api: string,
    method: string,
    body?: unknown,
  ): Promise<unknown> {
    const accessToken = await this.getAccessToken(
      installationInfo,
      userID,
    ).catch((error: unknown) => {
      throw new HttpException(
        `Failed to get access token: ${error instanceof Error ? error.message : 'unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const onesUrl = new URL(installationInfo.ones_base_url);
    const apiUrl = new URL(`${api}`, onesUrl);

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(apiUrl.toString(), requestOptions);

    if (!response.ok) {
      throw new Error(`OpenAPI call failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
