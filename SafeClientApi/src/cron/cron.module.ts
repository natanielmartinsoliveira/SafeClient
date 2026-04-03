import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemovalRequest } from '../removal-requests/removal-request.entity';
import { ReportsModule } from '../reports/reports.module';
import { RemovalCronService } from './removal-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([RemovalRequest]), ReportsModule],
  providers: [RemovalCronService],
  exports: [RemovalCronService],
})
export class CronModule {}
