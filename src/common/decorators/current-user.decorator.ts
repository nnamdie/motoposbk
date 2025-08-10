import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Member } from '../../auth/entities/member.entity';
import { User } from '../../auth/entities/user.entity';

export interface AuthenticatedUser {
  id: number;
  phone: string;
  businessId: string;
  memberId: number;
  isOwner: boolean;
  roles: string[];
  permissions: string[];
  user: User;
  member: Member;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
