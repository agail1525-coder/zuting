import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Google OAuth 2.0 strategy for web login.
 *
 * Flow:
 * 1. Redirect user to Google authorize URL
 * 2. Google redirects back with `code`
 * 3. Exchange code for id_token + access_token
 * 4. Decode id_token or call userinfo endpoint
 */

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  sub: string;         // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

@Injectable()
export class GoogleOAuthStrategy {
  private readonly logger = new Logger(GoogleOAuthStrategy.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('GOOGLE_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET', '');
    this.redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI', '');
  }

  /** Check if Google OAuth is configured */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.redirectUri);
  }

  /** Build the Google authorization URL */
  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /** Exchange authorization code for tokens */
  async getTokens(code: string): Promise<GoogleTokenResponse> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = await res.json();

    if (data.error) {
      this.logger.error(`Google token exchange failed: ${data.error_description || data.error}`);
      throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
    }

    return data as GoogleTokenResponse;
  }

  /** Fetch user info using access token */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();

    if (data.error) {
      this.logger.error(`Google userinfo failed: ${data.error.message}`);
      throw new Error(`Google userinfo error: ${data.error.message}`);
    }

    return data as GoogleUserInfo;
  }
}
