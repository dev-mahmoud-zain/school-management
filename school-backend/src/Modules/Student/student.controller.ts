import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, Res } from '@nestjs/common';
import { StudentService } from './student.service.js';
import { createStudentSchema } from './dto/create-student.dto.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import { updateStudentSchema } from './dto/update-student.dto.js';
import type { UpdateStudentDto } from './dto/update-student.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createStudentSchema))
  async create(@Body() createDto: CreateStudentDto, @Res() res: Response) {
    const student = await this.studentService.create(createDto);
    return successResponse({ res, statusCode: 201, message: 'Student created successfully', data: student });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const students = await this.studentService.findAll();
    return successResponse({ res, message: 'Students fetched successfully', data: students });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const student = await this.studentService.findOne(id);
    return successResponse({ res, message: 'Student fetched successfully', data: student });
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateStudentSchema))
  async update(@Param('id') id: string, @Body() updateDto: UpdateStudentDto, @Res() res: Response) {
    const student = await this.studentService.update(id, updateDto);
    return successResponse({ res, message: 'Student updated successfully', data: student });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.studentService.remove(id);
    return successResponse({ res, message: 'Student deleted successfully' });
  }
}
