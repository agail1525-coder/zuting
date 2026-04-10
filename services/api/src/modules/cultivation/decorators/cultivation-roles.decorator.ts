import { SetMetadata } from '@nestjs/common';

export const CULTIVATION_ROLES_KEY = 'cultivationRoles';

/**
 * 标注一个修行角色门槛 (基于五级角色阶梯)。
 * 例如 @CultivationRoles('MENTOR', 'MASTER')
 */
export const CultivationRoles = (...roles: string[]) =>
  SetMetadata(CULTIVATION_ROLES_KEY, roles);
