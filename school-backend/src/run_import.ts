import 'reflect-metadata';
import 'dotenv/config';
import fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ImportService } from './Modules/Import/import.service.js';
import { DataSource } from 'typeorm';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dataSource = app.get(DataSource);
  await dataSource.synchronize(true);

  const importService = app.get(ImportService);

  const getBuffer = (path: string) => ({ buffer: fs.readFileSync(path) });

  const files = {
    teachers: [getBuffer('teachers.csv')],
    classes: [getBuffer('classes.csv')],
    students: [getBuffer('students.csv')]
  };

  console.log('Running Initial Import...');
  const report1 = await importService.processImport(files);
  fs.writeFileSync('initial_import_report.json', JSON.stringify(report1, null, 2));

  console.log('Running Second Import...');
  const report2 = await importService.processImport(files);
  fs.writeFileSync('second_import_report.json', JSON.stringify(report2, null, 2));

  await app.close();
  console.log('Done!');
}

run().catch(console.error);
