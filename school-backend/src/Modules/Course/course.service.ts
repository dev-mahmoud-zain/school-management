import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../Database/Entities/courses.js';
import type { CreateCourseDto } from './dto/create-course.dto.js';
import type { UpdateCourseDto } from './dto/update-course.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class CourseService {
  private exceptionFactory = new ExceptionFactory();
  constructor(@InjectRepository(Course) private courseRepo: Repository<Course>) {}

  async create(createDto: CreateCourseDto) {
    const course = this.courseRepo.create(createDto);
    return await this.courseRepo.save(course);
  }

  async findAll() {
    return await this.courseRepo.find({ relations: { teacher: true, classroom: true, students: true } });
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOne({ where: { id }, relations: { teacher: true, classroom: true, students: true } });
    if (!course) throw this.exceptionFactory.notFound({ message: 'Course not found' });
    return course;
  }

  async update(id: string, updateDto: UpdateCourseDto) {
    const course = await this.findOne(id);
    Object.assign(course, updateDto);
    return await this.courseRepo.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    await this.courseRepo.softRemove(course);
    return { id };
  }
}
