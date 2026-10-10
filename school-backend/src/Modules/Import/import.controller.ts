
import { ApiTags, ApiBearerAuth, ApiCookieAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards, Res } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service.js';
import { AuthGuard } from '../../Common/Guards/auth.guard.js';
import { RolesGuard } from '../../Common/Guards/roles.guard.js';
import { Roles } from '../../Common/Decorators/roles.decorator.js';
import { successResponse } from '../../Common/Utils/Response/success.response.js';
import type { Response } from 'express';

@ApiTags('Import')
@ApiCookieAuth('SystemToken')
@ApiBearerAuth('BearerToken')
@Controller('admin/import')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin') // Restricted to Admin
export class ImportController {
  constructor(private readonly importService: ImportService) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { teachers: { type: 'string', format: 'binary' }, classes: { type: 'string', format: 'binary' }, students: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'teachers', maxCount: 1 },
    { name: 'classes', maxCount: 1 },
    { name: 'students', maxCount: 1 },
  ]))
  async importCsv(
    @UploadedFiles() files: { teachers?: any[], classes?: any[], students?: any[] },
    @Res() res: Response
  ) {
    const report = await this.importService.processImport(files || {});
    return successResponse({ res, message: 'Import processed successfully', data: report });
  }
}
