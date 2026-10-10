
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExceptionFactory } from '../Utils/Response/error.response.js';

@Injectable()
export class AuthGuard implements CanActivate {
  private exceptionFactory = new ExceptionFactory();

  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw this.exceptionFactory.unauthorized({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = this.configService.get<string>('USER_JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload;
    } catch {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid token' });
    }

    return true;
  }
}
