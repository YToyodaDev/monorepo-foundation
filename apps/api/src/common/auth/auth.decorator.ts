import {
  SetMetadata,
  UseGuards,
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Role } from 'src/common/types';

import { AuthGuard } from './auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

// Custom Decorator
// USAGE: AllowAuthenticated('admin','manager')
export const AllowAuthenticated = (...roles: Role[]) =>
  // Combine multiple decorators into one
  applyDecorators(
    // Store metadata which can later be accessed via Reflector
    SetMetadata('roles', roles),
    //
    UseGuards(AuthGuard),
  );
// Custom Decorator
// retrieves the user object created through above authentication process
export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const context = GqlExecutionContext.create(ctx);
  return context.getContext().req.user;
});
