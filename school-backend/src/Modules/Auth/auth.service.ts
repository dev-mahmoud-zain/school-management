
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../Database/Entities/accounts.js';
import type { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class AuthService {
  private exceptionFactory = new ExceptionFactory();

  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginDto: LoginDto) {
    const account = await this.accountRepo.findOne({ where: { email: loginDto.email } });
    if (!account) {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, account.passwordHash);
    if (!isPasswordValid) {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid credentials' });
    }

    const payload = { sub: account.id, email: account.email, role: account.role };
    
    // We use BearerToken for everyone now since role is baked into the token
    const secret = this.configService.get<string>('USER_JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, { secret, expiresIn: '1d' });
    
    return `Bearer ${token}`;
  }
}
