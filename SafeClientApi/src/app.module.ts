import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { Report } from './reports/report.entity';
import { RemovalRequest } from './removal-requests/removal-request.entity';
import { User } from './users/user.entity';
import { ReportsModule } from './reports/reports.module';
import { ContactsModule } from './contacts/contacts.module';
import { RemovalRequestsModule } from './removal-requests/removal-requests.module';
import { CronModule } from './cron/cron.module';
import { AuthModule } from './auth/auth.module';
import { WebReportsModule } from './web/web-reports.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 30 }, // 30 req/min per IP (lookup)
      { name: 'long', ttl: 3_600_000, limit: 20 }, // 20 req/h per IP (reports)
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'safeclient',
      password: process.env.DB_PASSWORD || 'safeclient_pass',
      database: process.env.DB_NAME || 'safeclient_db',
      entities: [Report, RemovalRequest, User],
      synchronize: true,
    }),
    ReportsModule,
    ContactsModule,
    RemovalRequestsModule,
    CronModule,
    AuthModule,
    WebReportsModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
