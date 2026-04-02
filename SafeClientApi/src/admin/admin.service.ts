import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Report } from '../reports/report.entity';
import { UsersService } from '../users/users.service';
import { UpdateReportDto } from './dto/update-report.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ContactType } from '../common/enums/contact-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    private readonly usersService: UsersService,
  ) {}

  // ── Reports ──────────────────────────────────────────────────────────────

  async listReports(page = 1, limit = 20, active?: boolean, contactType?: ContactType) {
    const where: FindManyOptions<Report>['where'] = {};
    if (active !== undefined) (where as any).active = active;
    if (contactType) (where as any).contactType = contactType;

    const [data, total] = await this.reportRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getReport(id: string) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Relato não encontrado.');
    return report;
  }

  async updateReport(id: string, dto: UpdateReportDto) {
    const report = await this.getReport(id);
    if (dto.description !== undefined) report.description = dto.description;
    if (dto.flags !== undefined) report.flags = dto.flags;
    if (dto.active !== undefined) report.active = dto.active;
    return this.reportRepo.save(report);
  }

  async softDeleteReport(id: string) {
    const report = await this.getReport(id);
    report.active = false;
    await this.reportRepo.save(report);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(page = 1, limit = 20) {
    const [data, total] = await this.usersService.findAll(page, limit);
    const safe = data.map(({ passwordHash: _, ...u }) => u);
    return { data: safe, total, page, limit };
  }

  async getUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async createUser(dto: AdminCreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, passwordHash, dto.role ?? 'user');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async updateUser(id: string, dto: AdminUpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const data: Parameters<typeof this.usersService.update>[1] = {};
    if (dto.email) data.email = dto.email;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    const updated = await this.usersService.update(id, data);
    const { passwordHash: _, ...safe } = updated!;
    return safe;
  }

  async deleteUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    await this.usersService.remove(id);
  }
}
