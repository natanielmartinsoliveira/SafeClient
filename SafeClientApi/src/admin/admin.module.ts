import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../reports/report.entity';
import { RemovalRequest } from '../removal-requests/removal-request.entity';
import { UsersModule } from '../users/users.module';
import { CronModule } from '../cron/cron.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, RemovalRequest]), UsersModule, CronModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
