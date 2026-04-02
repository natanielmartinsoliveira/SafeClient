// Set required env vars before any module import
process.env.CONTACT_HASH_SECRET = 'test-secret-for-unit-tests';

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { ContactType } from '../common/enums/contact-type.enum';
import { FlagType } from '../common/enums/flag-type.enum';

const mockRepo = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: jest.Mocked<Repository<Report>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repo = module.get(getRepositoryToken(Report));
  });

  describe('create', () => {
    const dto = {
      contact: '47991234567',
      contactType: ContactType.PHONE,
      flags: [FlagType.TENTATIVA_GOLPE],
      description: 'Teste',
    };

    it('should create a report and return id and createdAt', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.update.mockResolvedValue({ affected: 0 } as any);
      const saved = { id: 'uuid-1', createdAt: new Date() } as Report;
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(result).toMatchObject({ id: 'uuid-1' });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when same IP reported same contact within 24h', async () => {
      const existing = { id: 'x', createdAt: new Date() } as Report;
      repo.findOne.mockResolvedValue(existing);

      await expect(service.create(dto, '127.0.0.1'))
        .rejects.toThrow(ConflictException);
    });

    it('should attach userId and userEmail when provided', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.update.mockResolvedValue({ affected: 0 } as any);
      const saved = { id: 'uuid-2', createdAt: new Date() } as Report;
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create(dto, undefined, 'user-id', 'user@test.com');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-id', userEmail: 'user@test.com' }),
      );
    });
  });

  describe('findByContactHash', () => {
    it('should return active reports for a contact hash', async () => {
      const reports = [{ id: '1', active: true }] as Report[];
      repo.find.mockResolvedValue(reports);

      const result = await service.findByContactHash('hash123', ContactType.PHONE);
      expect(result).toEqual(reports);
      expect(repo.find).toHaveBeenCalledWith({
        where: { contactHash: 'hash123', contactType: ContactType.PHONE, active: true },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('deactivateByContactHash', () => {
    it('should soft-delete all active reports for a contact', async () => {
      repo.update.mockResolvedValue({ affected: 3 } as any);

      await service.deactivateByContactHash('hash123', ContactType.PHONE);
      expect(repo.update).toHaveBeenCalledWith(
        { contactHash: 'hash123', contactType: ContactType.PHONE, active: true },
        { active: false },
      );
    });
  });
});
