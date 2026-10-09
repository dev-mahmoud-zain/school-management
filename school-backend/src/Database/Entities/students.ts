import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseModel } from './base.model.js';
import { Course } from './courses.js';

@Entity('students')
export class Student extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'timestamp', nullable: true })
  enrollmentDate: Date;

  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable({ name: 'student_courses' })
  courses: Course[];
}
