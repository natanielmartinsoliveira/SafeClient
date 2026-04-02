import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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
})
export class AppModule {}
