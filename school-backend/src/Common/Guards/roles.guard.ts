import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../Decorators/roles.decorator.js';
import { ExceptionFactory } from '../Utils/Response/error.response.js';

@Injectable()
export class RolesGuard implements CanActivate {
  private exceptionFactory = new ExceptionFactory();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw this.exceptionFactory.forbidden({ message: 'Access denied: No role assigned' });
    }

    if (!requiredRoles.includes(user.role)) {
      throw this.exceptionFactory.forbidden({ message: 'You do not have permission to access this resource' });
    }
    
    return true;
  }
}
