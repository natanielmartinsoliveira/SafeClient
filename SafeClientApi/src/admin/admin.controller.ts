import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateReportDto } from './dto/update-report.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ContactType } from '../common/enums/contact-type.enum';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Reports ──────────────────────────────────────────────────────────────

  @Get('reports')
  listReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('active') active?: string,
    @Query('contactType') contactType?: ContactType,
  ) {
    const activeFilter = active === undefined ? undefined : active === 'true';
    return this.adminService.listReports(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      activeFilter,
      contactType,
    );
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.adminService.getReport(id);
  }

  @Patch('reports/:id')
  updateReport(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.adminService.updateReport(id, dto);
  }

  @Delete('reports/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDeleteReport(@Param('id') id: string) {
    return this.adminService.softDeleteReport(id);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.listUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Post('users')
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  @Get('stats')
  async stats() {
    const [reports, users] = await Promise.all([
      this.adminService.listReports(1, 1),
      this.adminService.listUsers(1, 1),
    ]);
    const [activeReports] = await Promise.all([
      this.adminService.listReports(1, 1, true),
    ]);
    return {
      totalReports: reports.total,
      activeReports: activeReports.total,
      inactiveReports: reports.total - activeReports.total,
      totalUsers: users.total,
    };
  }
}
