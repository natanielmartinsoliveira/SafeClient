import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemovalRequest } from './removal-request.entity';
import { RemovalRequestsService } from './removal-requests.service';
import { RemovalRequestsController } from './removal-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RemovalRequest])],
  providers: [RemovalRequestsService],
  controllers: [RemovalRequestsController],
})
export class RemovalRequestsModule {}
