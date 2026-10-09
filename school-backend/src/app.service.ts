import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  health(): {
    status: string;
    message: string;
    health: string;
  } {
    return {
      status: 'success',
      message: 'API is running success',
      health: 'online'
    };
  }


}
