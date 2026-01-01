import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Academia Hub API - Multi-tenant SaaS Backend';
  }
}

