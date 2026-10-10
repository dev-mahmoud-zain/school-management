import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../Database/Entities/teachers.js';
import { Classroom } from '../../Database/Entities/classrooms.js';
import type { CreateTeacherDto } from './dto/create-teacher.dto.js';
import type { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class TeacherService {
  private exceptionFactory = new ExceptionFactory();

  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {

    const emailExists = await this.teacherRepository.findOne({ where: { email: createTeacherDto.email } });

    if (emailExists) {
      throw this.exceptionFactory.conflict({ message: 'Teacher with this email already exists' });
    }

    const teacher = this.teacherRepository.create(createTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async findAll() {
    return await this.teacherRepository.find({ relations: { classrooms: true } });
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOne({ where: { id }, relations: { classrooms: true } });
    if (!teacher) {
      throw this.exceptionFactory.notFound({ message: 'Teacher not found' });
    }
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);
    
    Object.assign(teacher, updateTeacherDto);
    
    return await this.teacherRepository.save(teacher);
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    const classCount = await this.classroomRepo.count({ where: { teacher: { id } } });
    if (classCount > 0) throw this.exceptionFactory.conflict({ message: 'Cannot delete teacher with assigned classrooms' });
    await this.teacherRepository.softRemove(teacher); // Soft delete
    return { id };
  }
}
