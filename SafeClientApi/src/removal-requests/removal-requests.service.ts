import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemovalRequest } from './removal-request.entity';
import { CreateRemovalRequestDto } from './dto/create-removal-request.dto';
import { hashContact } from '../common/utils/contact-hasher.util';

@Injectable()
export class RemovalRequestsService {
  constructor(
    @InjectRepository(RemovalRequest)
    private readonly removalRepo: Repository<RemovalRequest>,
  ) {}

  async create(dto: CreateRemovalRequestDto) {
    const contactHash = hashContact(dto.contact, dto.contactType);

    const existing = await this.removalRepo.findOne({
      where: { contactHash, contactType: dto.contactType, status: 'pending' },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe uma solicitação de remoção pendente para este contato.',
      );
    }

    const request = this.removalRepo.create({
      contactHash,
      contactType: dto.contactType,
      reason: dto.reason ?? null,
      status: 'pending',
    });

    const saved = await this.removalRepo.save(request);
    return {
      id: saved.id,
      status: saved.status,
      message: 'Solicitação recebida. Em até 12 horas os dados serão removidos.',
      createdAt: saved.createdAt,
    };
  }
}
