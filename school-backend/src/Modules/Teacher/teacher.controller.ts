import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, Res } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { createTeacherSchema } from './dto/create-teacher.dto.js';
import type { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { updateTeacherSchema } from './dto/update-teacher.dto.js';
import type { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@Controller('teachers')
@UseGuards(AuthGuard) 
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTeacherSchema))
  async create(@Body() createTeacherDto: CreateTeacherDto, @Res() res: Response) {
    const teacher = await this.teacherService.create(createTeacherDto);
    return successResponse({ res, statusCode: 201, message: 'Teacher created successfully', data: teacher });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const teachers = await this.teacherService.findAll();
    return successResponse({ res, message: 'Teachers fetched successfully', data: teachers });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const teacher = await this.teacherService.findOne(id);
    return successResponse({ res, message: 'Teacher fetched successfully', data: teacher });
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTeacherSchema))
  async update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto, @Res() res: Response) {
    const teacher = await this.teacherService.update(id, updateTeacherDto);
    return successResponse({ res, message: 'Teacher updated successfully', data: teacher });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.teacherService.remove(id);
    return successResponse({ res, message: 'Teacher deleted successfully' });
  }
}
