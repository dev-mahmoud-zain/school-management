import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { BaseModel } from './base.model.js';
import { Teacher } from './teachers.js';
import { Classroom } from './classrooms.js';
import { Student } from './students.js';

@Entity('courses')
export class Course extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 3 })
  credits: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @ManyToOne(() => Classroom, (classroom) => classroom.courses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classroomId' })
  classroom: Classroom;

  @ManyToMany(() => Student, (student) => student.courses)
  students: Student[];
}
