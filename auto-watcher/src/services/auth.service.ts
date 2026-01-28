import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from './database.service';
import {
  JWTClaims,
  JWTAssertionClaim,
  InstallationInfo,
} from '../dto/install-callback.dto';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  async verifyAppJWTToken(tokenString: string): Promise<JWTClaims> {
    try {
      const decoded = jwt.decode(tokenString) as JWTClaims;
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const installationID = decoded.sub;
      const installInfo =
        await this.databaseService.getInstallation(installationID);
      if (!installInfo) {
        throw new Error('Installation not found');
      }

      const validKey = Buffer.from(installInfo.shared_secret, 'base64');
      const verified = jwt.verify(tokenString, validKey) as JWTClaims;

      return verified;
    } catch (error) {
      throw new Error(
        `JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  extractAppTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new Error('Authorization header is empty');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error(
        'Authorization header format error, should be: Bearer <token>',
      );
    }

    return parts[1];
  }

  async validateAppRequest(authHeader: string): Promise<JWTClaims> {
    const tokenString = this.extractAppTokenFromHeader(authHeader);
    const claims = await this.verifyAppJWTToken(tokenString);
    return claims;
  }

  genOAuthJWTAssertion(
    installationInfo: InstallationInfo,
    userID: string,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    const payload: JWTAssertionClaim = {
      uid: userID,
      rsh: '',
      iss: installationInfo.installation_id,
      sub: installationInfo.installation_id,
      aud: 'oauth',
      exp: now + 24 * 60 * 60, // 24 hours later
      iat: now,
      jti: jti, // Generate 16-bit JTI
    };

    const signKey = Buffer.from(installationInfo.shared_secret, 'base64');
    return jwt.sign(payload, signKey, { algorithm: 'HS256' });
  }
}
