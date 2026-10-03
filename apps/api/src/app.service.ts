import { Injectable } from '@nestjs/common';
import { APP_NAME, APP_VERSION } from '@fertilizer/shared';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      name: APP_NAME,
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
