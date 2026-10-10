
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Account } from './src/Database/Entities/accounts.js';
import { getDatabaseConfig } from './src/Database/Connection/connection.db.js';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Account]
  });
  await dataSource.initialize();
  await dataSource.synchronize(); // Apply schema changes for Accounts

  const accountRepo = dataSource.getRepository(Account);

  const accounts = [
    { name: 'Admin User', email: 'admin@gmail.com', password: 'password123', role: 'admin' },
    { name: 'Operator User', email: 'operator@gmail.com', password: 'password123', role: 'operator' },
    { name: 'Teacher User', email: 'teacher@gmail.com', password: 'password123', role: 'teacher' },
    { name: 'Ahmed Khaled', email: 'student@gmail.com', password: 'password123', role: 'student' }
  ];

  for (const acc of accounts) {
    const existing = await accountRepo.findOne({ where: { email: acc.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(acc.password, 10);
      const newAcc = accountRepo.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role });
      await accountRepo.save(newAcc);
      console.log(`Seeded ${acc.role} account (${acc.email})`);
    } else {
      console.log(`${acc.role} account already exists`);
    }
  }

  await dataSource.destroy();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
