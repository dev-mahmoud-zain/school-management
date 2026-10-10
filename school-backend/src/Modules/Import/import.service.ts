
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Papa from 'papaparse';
import { Teacher } from '../../Database/Entities/teachers.js';
import { Classroom } from '../../Database/Entities/classrooms.js';
import { Student } from '../../Database/Entities/students.js';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
    @InjectRepository(Classroom) private classRepo: Repository<Classroom>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    private dataSource: DataSource,
  ) {}

  private parseCsv(fileBuffer: Buffer): any[] {
    if (!fileBuffer) return [];
    const csvData = fileBuffer.toString('utf8');
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
    return parsed.data;
  }

  async processImport(files: { teachers?: any[], classes?: any[], students?: any[] }) {
    const report = {
      teachers: { success: 0, skipped: 0, errors: [], details: [] },
      classes: { success: 0, skipped: 0, errors: [], details: [] },
      students: { success: 0, skipped: 0, errors: [], details: [] },
    };

    // Parse files
    const teachersData = files.teachers ? this.parseCsv(files.teachers[0].buffer) : [];
    const classesData = files.classes ? this.parseCsv(files.classes[0].buffer) : [];
    const studentsData = files.students ? this.parseCsv(files.students[0].buffer) : [];

    const logRow = (type: string, status: 'success' | 'skipped' | 'error', row: any, reason?: string) => {
      (report as any)[type][status]++;
      const r = { row, status, reason };
      (report as any)[type].details.push(r);
      if (status === 'error') (report as any)[type].errors.push(r);
    };

    // 1. Process Teachers
    const teacherMap = new Map<string, Teacher>(); 
    const teacherNameMap = new Map<string, Teacher>(); 

    const existingTeachers = await this.teacherRepo.find();
    existingTeachers.forEach(t => {
      teacherMap.set(t.email, t);
      teacherNameMap.set(t.name, t);
    });

    for (const row of teachersData) {
      try {
        const name = row.name?.trim();
        const email = row.email?.trim();

        if (!name || !email) {
          logRow('teachers', 'error', row, 'Missing name or email');
          continue;
        }

        if (teacherMap.has(email)) {
          logRow('teachers', 'skipped', row, 'Teacher with this email already exists');
          continue;
        }

        const teacher = this.teacherRepo.create({ name, email });
        const saved = await this.teacherRepo.save(teacher);
        teacherMap.set(email, saved);
        teacherNameMap.set(name, saved);
        logRow('teachers', 'success', row);
      } catch (e: any) {
        logRow('teachers', 'error', row, e.message);
      }
    }

    // 2. Process Classes
    const classMap = new Map<string, Classroom>();
    const existingClasses = await this.classRepo.find({ relations: { students: true } });
    existingClasses.forEach(c => classMap.set(c.name, c));

    for (const row of classesData) {
      try {
        const name = row.name?.trim() || row.class?.trim() || row.room?.trim();
        const capacityStr = row.capacity?.trim();
        const teacherRef = row.teacher?.trim() || row.teacher_email?.trim() || row.teacher_name?.trim();

        if (!name || !capacityStr) {
          logRow('classes', 'error', row, 'Missing name or capacity');
          continue;
        }

        const capacity = parseInt(capacityStr, 10);
        if (isNaN(capacity) || capacity <= 0) {
          logRow('classes', 'error', row, 'Invalid capacity value');
          continue;
        }

        let teacherObj = null;
        if (teacherRef) {
          teacherObj = teacherMap.get(teacherRef) || teacherNameMap.get(teacherRef);
          if (!teacherObj) {
            logRow('classes', 'error', row, `Teacher '${teacherRef}' not found`);
            continue;
          }
        }

        if (classMap.has(name)) {
          const existing = classMap.get(name)!;
          const currentStudentCount = existing.students ? existing.students.length : 0;
          if (capacity < currentStudentCount) {
             logRow('classes', 'error', row, `Cannot reduce capacity (${capacity}) below current students (${currentStudentCount})`);
             continue;
          }
          existing.capacity = capacity;
          if (teacherObj) existing.teacher = teacherObj;
          await this.classRepo.save(existing);
          logRow('classes', 'success', row, 'Updated existing classroom');
          continue;
        }

        const classroom = this.classRepo.create({ name, capacity, ...(teacherObj && { teacher: teacherObj }) });
        const saved = await this.classRepo.save(classroom);
        saved.students = [];
        classMap.set(name, saved);
        logRow('classes', 'success', row);
      } catch (e: any) {
        logRow('classes', 'error', row, e.message);
      }
    }

    // 3. Process Students
    const studentMap = new Map<string, Student>();
    const existingStudents = await this.studentRepo.find({ relations: { classroom: true } });
    existingStudents.forEach(s => studentMap.set(s.email, s));

    for (const row of studentsData) {
      try {
        const name = row.name?.trim();
        const email = row.email?.trim();
        const classRef = row.class?.trim() || row.classroom?.trim() || row.class_name?.trim();

        if (!name || !email) {
          logRow('students', 'error', row, 'Missing name or email');
          continue;
        }

        if (studentMap.has(email)) {
          logRow('students', 'skipped', row, 'Student with this email already exists');
          continue;
        }

        let classObj = null;
        if (classRef) {
          classObj = classMap.get(classRef);
          if (!classObj) {
            logRow('students', 'error', row, `Class '${classRef}' not found`);
            continue;
          }
          
          const currentCount = classObj.students ? classObj.students.length : 0;
          if (currentCount >= classObj.capacity) {
            logRow('students', 'error', row, `Class '${classRef}' is at full capacity`);
            continue;
          }
        }

        const student = this.studentRepo.create({ name, email, ...(classObj && { classroom: classObj }) });
        const saved = await this.studentRepo.save(student);
        studentMap.set(email, saved);
        
        if (classObj) {
           if (!classObj.students) classObj.students = [];
           classObj.students.push(saved); 
        }
        
        logRow('students', 'success', row);
      } catch (e: any) {
        logRow('students', 'error', row, e.message);
      }
    }

    return report;
  }
}
