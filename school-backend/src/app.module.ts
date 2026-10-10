import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './Database/Connection/connection.db.js';
import { DatabaseService } from './Database/Connection/database.service.js';
import { Account } from './Database/Entities/accounts.js';
import { Classroom } from './Database/Entities/classrooms.js';
import { Student } from './Database/Entities/students.js';
import { AuthModule } from './Modules/Auth/auth.module.js';
import { TeacherModule } from './Modules/Teacher/teacher.module.js';
import { StudentModule } from './Modules/Student/student.module.js';
import { ClassroomModule } from './Modules/Classroom/classroom.module.js';
import { ImportModule } from './Modules/Import/import.module.js';

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
    TypeOrmModule.forFeature([Account, Classroom, Student]),
    AuthModule,
    TeacherModule,
    StudentModule,
    ClassroomModule,
    ImportModule,
    ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
