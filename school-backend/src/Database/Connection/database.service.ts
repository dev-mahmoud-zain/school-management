import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}
  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('> Database connected successfully');
    }
  }
}