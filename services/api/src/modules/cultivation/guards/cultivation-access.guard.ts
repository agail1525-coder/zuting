import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * 守护 M37 修行系统的访问权限。
 * 必须配合 JwtAuthGuard 使用，置于其后。
 */
@Injectable()
export class CultivationAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('需要登录');
    }
    if (!user.cultivationAccess) {
      throw new ForbiddenException({
        code: 'CULTIVATION_REQUIRED',
        message: '需要修行资格。请先申请或使用邀请码。',
        applyUrl: '/trips/cultivation/apply',
      });
    }
    if (
      user.cultivationExpiresAt &&
      new Date(user.cultivationExpiresAt).getTime() < Date.now()
    ) {
      throw new ForbiddenException({
        code: 'CULTIVATION_EXPIRED',
        message: '修行资格已过期',
      });
    }
    return true;
  }
}
