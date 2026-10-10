
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseModel } from './base.model.js';
import { Classroom } from './classrooms.js';

@Entity('students')
export class Student extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'timestamp', nullable: true })
  enrollmentDate: Date;

  @ManyToOne(() => Classroom, (classroom) => classroom.students, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classroomId' })
  classroom: Relation<Classroom>;
}
