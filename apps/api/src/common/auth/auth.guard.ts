import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/types';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  // 1. this method is automatically called by useGuard()
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 2. get GraphQL context
    const ctx = GqlExecutionContext.create(context);
    // 3. get req object similar to of HTTP
    const req = ctx.getContext().req;
    // 4. validate jwtToken and store the current user to the req object
    await this.authenticateUser(req);
    // 5.
    return this.authorizeUser(req, context);
  }
  //
  private async authenticateUser(req: any): Promise<void> {
    const bearerHeader = req.headers.authorization;
    // Split "Bearer eylskfdjlsdf309"
    const token = bearerHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided.');
    }

    try {
      const payload = await this.jwtService.verify(token);
      const uid = payload.uid;

      if (!uid) {
        throw new UnauthorizedException(
          'Invalid token. No uid present in the token.',
        );
      }
      const user = await this.prisma.user.findUnique({ where: { uid } });
      if (!user) {
        throw new UnauthorizedException(
          'Invalid token. No user present with the uid.',
        );
      }
      req.user = payload;
    } catch (err) {
      console.error('Token validation error:', err);
    }

    if (!req.user) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  private async authorizeUser(
    req: any,
    context: ExecutionContext,
  ): Promise<boolean> {
    // retrieve 'roles' previously set at AllowAuthenticated()
    const requiredRoles = this.getMetadata<Role[]>('roles', context);
    // Look up DB tables
    const userRoles = await this.getUserRoles(req.user.uid);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    req.user.roles = userRoles;

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  /**
   *  searches for metadata associated with the specified key at both the handler (method) and class levels. If metadata is found at both levels, the method-level metadata takes precedence.
    if you want to get metadata for both and merge it, Use getAllAndMerge() instead
   * @param key 
   * @param context 
   * @returns 
   */
  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async getUserRoles(uid: string): Promise<Role[]> {
    const roles: Role[] = [];

    const [admin] = await Promise.all([
      this.prisma.admin.findUnique({ where: { uid } }),
      // TODO: Add promises for other role models here
      // EXAMPLE
      // this.prisma.manager.findUnique({ where: { uid } }),
    ]);

    admin && roles.push('admin');
    // TODO: Do not forget to puss roles  if you add more.
    // manager && roles.push('manager');

    return roles;
  }
}
// authentication answers the question, "Who are you?" while //authorization addresses, "What are you allowed to do?"
