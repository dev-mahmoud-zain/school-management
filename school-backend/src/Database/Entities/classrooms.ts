
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseModel } from './base.model.js';
import { Teacher } from './teachers.js';
import { Student } from './students.js';

@Entity('classrooms')
export class Classroom extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ default: 30 })
  capacity: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.classrooms, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Relation<Teacher>;

  @OneToMany(() => Student, (student) => student.classroom)
  students: Relation<Student[]>;
}
