import { ApiTags, ApiBearerAuth, ApiCookieAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, Res } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { createTeacherSchema } from './dto/create-teacher.dto.js';
import type { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { updateTeacherSchema } from './dto/update-teacher.dto.js';
import type { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { RolesGuard } from '../../Common/Guards/roles.guard.js';
import { Roles } from '../../Common/Decorators/roles.decorator.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@ApiTags('Teachers')
@ApiCookieAuth('SystemToken')
@ApiBearerAuth('BearerToken')
@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin') 
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiBody({ schema: {"type":"object","properties":{"name":{"type":"string"},"email":{"type":"string"},"phone":{"type":"string"}},"required":["name","email"]} })
  @Post()
  @Roles('admin', 'operator')
  @UsePipes(new ZodValidationPipe(createTeacherSchema))
  async create(@Body() createTeacherDto: CreateTeacherDto, @Res() res: Response) {
    const teacher = await this.teacherService.create(createTeacherDto);
    return successResponse({ res, statusCode: 201, message: 'Teacher created successfully', data: teacher });
  }

  @Get()
  @Roles('admin', 'operator', 'student', 'teacher')
  async findAll(@Res() res: Response) {
    const teachers = await this.teacherService.findAll();
    return successResponse({ res, message: 'Teachers fetched successfully', data: teachers });
  }

  @Get(':id')
  @Roles('admin', 'operator', 'student', 'teacher')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const teacher = await this.teacherService.findOne(id);
    return successResponse({ res, message: 'Teacher fetched successfully', data: teacher });
  }

  @ApiBody({ schema: {"type":"object","properties":{"name":{"type":"string"},"email":{"type":"string"},"phone":{"type":"string"}}} })
  @Patch(':id')
  @Roles('admin', 'operator')
  @UsePipes(new ZodValidationPipe(updateTeacherSchema))
  async update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto, @Res() res: Response) {
    const teacher = await this.teacherService.update(id, updateTeacherDto);
    return successResponse({ res, message: 'Teacher updated successfully', data: teacher });
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.teacherService.remove(id);
    return successResponse({ res, message: 'Teacher deleted successfully' });
  }
}
