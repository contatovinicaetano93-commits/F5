import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * JWT auth stub — replace with passport-jwt validation later.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      request.user = { id: 'stub-user-id' };
    }
    return true;
  }
}
