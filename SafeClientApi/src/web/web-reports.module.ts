import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { ReportsModule } from '../reports/reports.module';
import { WebReportsController } from './web-reports.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme_please',
      signOptions: { expiresIn: '7d' },
    }),
    ReportsModule,
  ],
  controllers: [WebReportsController],
  providers: [JwtStrategy, JwtAuthGuard],
})
export class WebReportsModule {}
