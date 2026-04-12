import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      const req = context.switchToHttp().getRequest();
      const hasAuth = req?.headers?.authorization;
      if (!hasAuth) return true;
      // Try to populate req.user if token present, but don't reject on failure
      return Promise.resolve(super.canActivate(context) as any)
        .catch(() => true)
        .then(() => true);
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // On public routes, don't throw — just pass through (user may be undefined)
      return user || null;
    }
    if (err || !user) throw err || new (require('@nestjs/common').UnauthorizedException)();
    return user;
  }
}
