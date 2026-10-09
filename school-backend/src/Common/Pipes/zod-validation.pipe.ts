import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';
import { ExceptionFactory } from '../Utils/Response/error.response.js';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate the request body
    if (metadata.type !== 'body') {
      return value;
    }
    
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      const exceptionFactory = new ExceptionFactory();
      if (error instanceof ZodError) {
        throw exceptionFactory.badRequest({
          message: 'Validation failed',
          issues: error.issues.map(i => ({ path: i.path.join('.'), info: i.message })),
        });
      }
      throw exceptionFactory.badRequest({ message: 'Validation failed' });
    }
  }
}
