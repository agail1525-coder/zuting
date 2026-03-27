import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * WeChat OAuth 2.0 strategy for web login (open.weixin.qq.com).
 *
 * Flow:
 * 1. Redirect user to WeChat authorize URL
 * 2. WeChat redirects back with `code`
 * 3. Exchange code for access_token + openid
 * 4. Fetch user info (nickname, avatar, unionid)
 */

export interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export interface WechatTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatOAuthStrategy {
  private readonly logger = new Logger(WechatOAuthStrategy.name);
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('WECHAT_APP_ID', '');
    this.appSecret = this.config.get<string>('WECHAT_APP_SECRET', '');
    this.redirectUri = this.config.get<string>('WECHAT_REDIRECT_URI', '');
  }

  /** Check if WeChat OAuth is configured */
  isConfigured(): boolean {
    return !!(this.appId && this.appSecret && this.redirectUri);
  }

  /** Build the WeChat authorization URL */
  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      appid: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'snsapi_login',
      state,
    });
    return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
  }

  /** Exchange authorization code for access token + openid */
  async getAccessToken(code: string): Promise<WechatTokenResponse> {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const data: WechatTokenResponse = await res.json();

    if (data.errcode) {
      this.logger.error(`WeChat token exchange failed: ${data.errmsg} (${data.errcode})`);
      throw new Error(`WeChat OAuth error: ${data.errmsg}`);
    }

    return data;
  }

  /** Fetch user info using access token */
  async getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const data = await res.json();

    if (data.errcode) {
      this.logger.error(`WeChat userinfo failed: ${data.errmsg} (${data.errcode})`);
      throw new Error(`WeChat userinfo error: ${data.errmsg}`);
    }

    return data as WechatUserInfo;
  }
}
