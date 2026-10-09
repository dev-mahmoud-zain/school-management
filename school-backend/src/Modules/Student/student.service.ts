import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../Database/Entities/students.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import type { UpdateStudentDto } from './dto/update-student.dto.js';
import { ExceptionFactory } from '../../Common/Utils/Response/error.response.js';

@Injectable()
export class StudentService {
  private exceptionFactory = new ExceptionFactory();
  constructor(@InjectRepository(Student) private studentRepo: Repository<Student>) {}

  async create(createDto: CreateStudentDto) {
    const existing = await this.studentRepo.findOne({ where: { email: createDto.email } });
    if (existing) throw this.exceptionFactory.conflict({ message: 'Student with this email already exists' });
    const student = this.studentRepo.create(createDto);
    return await this.studentRepo.save(student);
  }

  async findAll() {
    return await this.studentRepo.find({ relations: { courses: true } });
  }

  async findOne(id: string) {
    const student = await this.studentRepo.findOne({ where: { id }, relations: { courses: true } });
    if (!student) throw this.exceptionFactory.notFound({ message: 'Student not found' });
    return student;
  }

  async update(id: string, updateDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    Object.assign(student, updateDto);
    return await this.studentRepo.save(student);
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.studentRepo.softRemove(student);
    return { id };
  }
}
