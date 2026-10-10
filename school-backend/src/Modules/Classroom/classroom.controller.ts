import {
  ApiTags,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Res,
} from '@nestjs/common';
import { ClassroomService } from './classroom.service.js';
import { createClassroomSchema } from './dto/create-classroom.dto.js';
import type { CreateClassroomDto } from './dto/create-classroom.dto.js';
import { updateClassroomSchema } from './dto/update-classroom.dto.js';
import type { UpdateClassroomDto } from './dto/update-classroom.dto.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { RolesGuard } from '../../Common/Guards/roles.guard.js';
import { Roles } from '../../Common/Decorators/roles.decorator.js';
import { ZodValidationPipe } from '../../Common/Pipes/zod-validation.pipe.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@ApiTags('Classrooms')
@ApiCookieAuth('SystemToken')
@ApiBearerAuth('BearerToken')
@Controller('classrooms')
@UseGuards(AuthGuard, RolesGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        capacity: { type: 'number' },
        teacherId: { type: 'string', format: 'uuid' },
      },
      required: ['name'],
    },
  })
  @Post()
  @Roles('admin', 'operator')
  @UsePipes(new ZodValidationPipe(createClassroomSchema))
  async create(@Body() createDto: CreateClassroomDto, @Res() res: Response) {
    const classroom = await this.classroomService.create(createDto);
    return successResponse({
      res,
      statusCode: 201,
      message: 'Classroom created successfully',
      data: classroom,
    });
  }

  @Get()
  @Roles('admin', 'operator', 'student', 'teacher')
  async findAll(@Res() res: Response) {
    const classrooms = await this.classroomService.findAll();
    return successResponse({
      res,
      message: 'Classrooms fetched successfully',
      data: classrooms,
    });
  }

  @Get(':id')
  @Roles('admin', 'operator', 'student', 'teacher')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const classroom = await this.classroomService.findOne(id);
    return successResponse({
      res,
      message: 'Classroom fetched successfully',
      data: classroom,
    });
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        capacity: { type: 'number' },
        teacherId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @Patch(':id')
  @Roles('admin', 'operator')
  @UsePipes(new ZodValidationPipe(updateClassroomSchema))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClassroomDto,
    @Res() res: Response,
  ) {
    const classroom = await this.classroomService.update(id, updateDto);
    return successResponse({
      res,
      message: 'Classroom updated successfully',
      data: classroom,
    });
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.classroomService.remove(id);
    return successResponse({ res, message: 'Classroom deleted successfully' });
  }
}
