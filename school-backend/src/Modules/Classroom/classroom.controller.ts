import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, Res } from '@nestjs/common';
import { ClassroomService } from './classroom.service.js';
import { createClassroomSchema } from './dto/create-classroom.dto.js';
import type { CreateClassroomDto } from './dto/create-classroom.dto.js';
import { updateClassroomSchema } from './dto/update-classroom.dto.js';
import type { UpdateClassroomDto } from './dto/update-classroom.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@Controller('classrooms')
@UseGuards(AuthGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createClassroomSchema))
  async create(@Body() createDto: CreateClassroomDto, @Res() res: Response) {
    const classroom = await this.classroomService.create(createDto);
    return successResponse({ res, statusCode: 201, message: 'Classroom created successfully', data: classroom });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const classrooms = await this.classroomService.findAll();
    return successResponse({ res, message: 'Classrooms fetched successfully', data: classrooms });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const classroom = await this.classroomService.findOne(id);
    return successResponse({ res, message: 'Classroom fetched successfully', data: classroom });
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateClassroomSchema))
  async update(@Param('id') id: string, @Body() updateDto: UpdateClassroomDto, @Res() res: Response) {
    const classroom = await this.classroomService.update(id, updateDto);
    return successResponse({ res, message: 'Classroom updated successfully', data: classroom });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.classroomService.remove(id);
    return successResponse({ res, message: 'Classroom deleted successfully' });
  }
}
