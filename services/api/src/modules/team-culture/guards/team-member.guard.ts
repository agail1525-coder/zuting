import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Guard: caller must be a member of the team referenced by route param `id` or `teamId`.
 * Use after JwtAuthGuard. Admin role bypasses.
 */
@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.id) throw new ForbiddenException('Auth required');
    if (user.role === 'ADMIN') return true;

    const teamId: string | undefined = req.params?.id ?? req.params?.teamId;
    if (!teamId) throw new ForbiddenException('teamId param required');

    const team = await this.prisma.team.findUnique({ where: { id: teamId }, select: { id: true } });
    if (!team) throw new NotFoundException('Team not found');

    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
      select: { role: true },
    });
    if (!member) throw new ForbiddenException('Not a team member');
    req.teamRole = member.role;
    return true;
  }
}
