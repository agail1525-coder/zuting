import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CULTIVATION_ROLES_KEY } from '../decorators/cultivation-roles.decorator';

const ROLE_RANK: Record<string, number> = {
  NONE: 0,
  SEEKER: 1,
  PRACTITIONER: 2,
  MENTOR: 3,
  MASTER: 4,
};

@Injectable()
export class CultivationRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      CULTIVATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const userRank = ROLE_RANK[user?.cultivationRole ?? 'NONE'] ?? 0;
    const minRank = Math.min(...required.map((r) => ROLE_RANK[r] ?? 99));

    if (userRank < minRank) {
      throw new ForbiddenException({
        code: 'CULTIVATION_ROLE_INSUFFICIENT',
        message: `需要 ${required.join('|')} 角色`,
      });
    }
    return true;
  }
}
