import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../Database/Entities/admins.js';
import type { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class AuthService {
  private exceptionFactory = new ExceptionFactory();

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async loginAdmin(loginDto: LoginDto) {
    const admin = await this.adminRepository.findOne({ where: { email: loginDto.email } });
    if (!admin) {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw this.exceptionFactory.unauthorized({ message: 'Invalid credentials' });
    }

    const payload = { sub: admin.id, email: admin.email, role: 'admin' };
    const secret = this.configService.get<string>('ADMIN_JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, { secret, expiresIn: '1d' });
    
    return `System ${token}`;
  }

  // Placeholder for regular users (e.g. Students/Teachers)
  async loginUser(loginDto: LoginDto) {
    // In the future: find user in student/teacher repo, verify password...
    const payload = { email: loginDto.email, role: 'user' };
    const secret = this.configService.get<string>('USER_JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, { secret, expiresIn: '1d' });
    return `Bearer ${token}`;
  }
}
