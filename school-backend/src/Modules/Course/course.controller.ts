import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, Res } from '@nestjs/common';
import { CourseService } from './course.service.js';
import { createCourseSchema } from './dto/create-course.dto.js';
import type { CreateCourseDto } from './dto/create-course.dto.js';
import { updateCourseSchema } from './dto/update-course.dto.js';
import type { UpdateCourseDto } from './dto/update-course.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@Controller('courses')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCourseSchema))
  async create(@Body() createDto: CreateCourseDto, @Res() res: Response) {
    const course = await this.courseService.create(createDto);
    return successResponse({ res, statusCode: 201, message: 'Course created successfully', data: course });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const courses = await this.courseService.findAll();
    return successResponse({ res, message: 'Courses fetched successfully', data: courses });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const course = await this.courseService.findOne(id);
    return successResponse({ res, message: 'Course fetched successfully', data: course });
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateCourseSchema))
  async update(@Param('id') id: string, @Body() updateDto: UpdateCourseDto, @Res() res: Response) {
    const course = await this.courseService.update(id, updateDto);
    return successResponse({ res, message: 'Course updated successfully', data: course });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.courseService.remove(id);
    return successResponse({ res, message: 'Course deleted successfully' });
  }
}
