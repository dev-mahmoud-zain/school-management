import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './Database/Connection/connection.db.js';
import { DatabaseService } from './Database/Connection/database.service.js';
import { Admin } from './Database/Entities/admins.js';
import { Course } from './Database/Entities/courses.js';
import { Classroom } from './Database/Entities/classrooms.js';
import { Student } from './Database/Entities/students.js';
import { AuthModule } from './Modules/Auth/auth.module.js';
import { TeacherModule } from './Modules/Teacher/teacher.module.js';
import { StudentModule } from './Modules/Student/student.module.js';
import { ClassroomModule } from './Modules/Classroom/classroom.module.js';
import { CourseModule } from './Modules/Course/course.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TypeOrmModule.forFeature([Admin, Course, Classroom, Student]),
    AuthModule,
    TeacherModule,
    StudentModule,
    ClassroomModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
