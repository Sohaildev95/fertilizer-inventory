import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Profile } from '@fertilizer/shared';

export interface AuthenticatedUser extends Profile {
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data && user ? user[data] : user;
  },
);
