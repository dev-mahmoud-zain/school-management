import { Controller, Post, Body, Res, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { loginSchema } from './dto/login.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async loginAdmin(@Body() loginDto: LoginDto, @Res() res: Response) {
    
    const systemToken = await this.authService.loginAdmin(loginDto);
    
    res.cookie('Authentication', systemToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    });

    return successResponse({ res, message: 'Admin logged in successfully' });
  }

  // Example route for a standard user login
  @Post('user/login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async loginUser(@Body() loginDto: LoginDto, @Res() res: Response) {
    const bearerToken = await this.authService.loginUser(loginDto);
    
    // Returned in response body for normal users
    return successResponse({ res, message: 'User logged in successfully', data: { token: bearerToken } });
  }
}
