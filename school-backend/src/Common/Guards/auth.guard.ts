import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ExceptionFactory } from '../Utils/Response/error.response.js';

@Injectable()
export class AuthGuard implements CanActivate {
  private exceptionFactory = new ExceptionFactory();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check Cookie for System token or Authorization header for Bearer token
    let tokenStr = request.cookies?.['Authentication'];
    
    if (!tokenStr) {
      tokenStr = request.headers.authorization;
    }

    if (!tokenStr) {
      throw this.exceptionFactory.unauthorized({ message: 'No token provided' });
    }

    let secret = '';
    let token = '';

    if (tokenStr.startsWith('System ')) {
      token = tokenStr.split(' ')[1];
      secret = this.configService.get<string>('ADMIN_JWT_SECRET') || '';
    } else if (tokenStr.startsWith('Bearer ')) {
      token = tokenStr.split(' ')[1];
      secret = this.configService.get<string>('USER_JWT_SECRET') || '';
    } else {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid token format. Must be System or Bearer token.' });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });
      (request as any)['user'] = payload;
    } catch {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid or expired token' });
    }

    return true;
  }
}
