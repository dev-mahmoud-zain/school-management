import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DataSource } from 'typeorm';
import { Admin } from './Database/Entities/admins.js';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createDefaultAdmin() {
  // Create an application context instead of a full HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const adminRepository = dataSource.getRepository(Admin);

  const adminCount = await adminRepository.count();

  if (adminCount > 0) {
    console.log('Admins already exist in the database. Seeding skipped.');
  } else {
    console.log('No admins found. Creating default admin...');

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.ADMIN_NAME
    ) {
      console.log(
        'Please provide ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME environment variables.',
      );
      process.exit(1);
    }

    const admin = {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME,
    };

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(admin.password, saltRounds);

    const newAdmin = adminRepository.create({
      name: admin.name,
      email: admin.email,
      passwordHash,
    });

    await adminRepository.save(newAdmin);

    console.log(`The Default Admin Created Successfully`);
  }

  await app.close();
  process.exit(0);
}

createDefaultAdmin();
