import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { BaseModel } from './base.model.js';

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
}
