import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { hashContact } from '../common/utils/contact-hasher.util';
import { ContactType } from '../common/enums/contact-type.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  async create(
    dto: CreateReportDto,
    ip?: string,
    userId?: string,
    userEmail?: string,
  ): Promise<{ id: string; createdAt: Date }> {
    const contactHash = hashContact(dto.contact, dto.contactType);
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;

    // Dedup: mesmo IP não pode reportar o mesmo contato mais de uma vez em 24h
    if (ipHash) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await this.reportRepo.findOne({
        where: { contactHash, contactType: dto.contactType, ipHash },
      });
      if (existing && existing.createdAt > since) {
        throw new ConflictException('Você já registrou um relato para este contato nas últimas 24h.');
      }
    }

    // Reativa reports desativados para este contato (remoção prévia)
    await this.reportRepo.update(
      { contactHash, contactType: dto.contactType, active: false },
      { active: true },
    );

    const reportData: DeepPartial<Report> = {
      contactHash,
      contactType: dto.contactType,
      flags: dto.flags,
      description: dto.description ?? null,
      ipHash,
      active: true,
      userId: userId ?? null,
      userEmail: userEmail ?? null,
    };
    const report = this.reportRepo.create(reportData);
    const saved = await this.reportRepo.save(report);
    return { id: saved.id, createdAt: saved.createdAt };
  }

  async findByContactHash(contactHash: string, contactType: ContactType): Promise<Report[]> {
    return this.reportRepo.find({
      where: { contactHash, contactType, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateByContactHash(contactHash: string, contactType: ContactType): Promise<void> {
    await this.reportRepo.update(
      { contactHash, contactType, active: true },
      { active: false },
    );
  }
}
