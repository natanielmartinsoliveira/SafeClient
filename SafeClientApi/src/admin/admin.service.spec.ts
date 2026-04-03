// Mock bcrypt before any imports to avoid native binary SIGSEGV in WSL/Jest
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Report } from '../reports/report.entity';
import { RemovalRequest } from '../removal-requests/removal-request.entity';
import { UsersService } from '../users/users.service';
import { RemovalCronService } from '../cron/removal-cron.service';
import { User } from '../users/user.entity';
import { FlagType } from '../common/enums/flag-type.enum';

const mockReportRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockRemovalRepo = () => ({
  find: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
});

const mockUsersService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCronService = () => ({
  processRemovalRequests: jest.fn().mockResolvedValue(undefined),
});

describe('AdminService', () => {
  let service: AdminService;
  let reportRepo: { findAndCount: jest.Mock; findOne: jest.Mock; save: jest.Mock };
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Report), useFactory: mockReportRepo },
        { provide: getRepositoryToken(RemovalRequest), useFactory: mockRemovalRepo },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: RemovalCronService, useFactory: mockCronService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    reportRepo = module.get(getRepositoryToken(Report));
    usersService = module.get(UsersService);
  });

  describe('listReports', () => {
    it('should return paginated reports', async () => {
      const reports = [{ id: '1' }] as Report[];
      reportRepo.findAndCount.mockResolvedValue([reports, 1]);

      const result = await service.listReports(1, 10);
      expect(result).toMatchObject({ data: reports, total: 1, page: 1, limit: 10 });
    });
  });

  describe('getReport', () => {
    it('should return report when found', async () => {
      const report = { id: 'uuid-1' } as Report;
      reportRepo.findOne.mockResolvedValue(report);

      const result = await service.getReport('uuid-1');
      expect(result).toEqual(report);
    });

    it('should throw NotFoundException when not found', async () => {
      reportRepo.findOne.mockResolvedValue(null);
      await expect(service.getReport('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteReport', () => {
    it('should set active to false', async () => {
      const report = { id: '1', active: true } as Report;
      reportRepo.findOne.mockResolvedValue(report);
      reportRepo.save.mockResolvedValue({ ...report, active: false });

      await service.softDeleteReport('1');
      expect(reportRepo.save).toHaveBeenCalledWith({ id: '1', active: false });
    });
  });

  describe('updateReport', () => {
    it('should update flags and description', async () => {
      const report = {
        id: '1',
        flags: [FlagType.NAO_COMPARECEU],
        description: 'old',
        active: true,
      } as Report;
      reportRepo.findOne.mockResolvedValue(report);
      reportRepo.save.mockImplementation((r: Report) => Promise.resolve(r));

      const result = await service.updateReport('1', {
        flags: [FlagType.TENTATIVA_GOLPE],
        description: 'new',
      });
      expect(result.flags).toEqual([FlagType.TENTATIVA_GOLPE]);
      expect(result.description).toBe('new');
    });
  });

  describe('listUsers', () => {
    it('should return paginated users without passwordHash', async () => {
      const users = [
        { id: '1', email: 'a@b.com', role: 'user', passwordHash: 'secret', createdAt: new Date() },
      ] as User[];
      usersService.findAll.mockResolvedValue([users, 1]);

      const result = await service.listUsers(1, 10);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.total).toBe(1);
    });
  });

  describe('createUser', () => {
    it('should create user and return without passwordHash', async () => {
      const user = {
        id: '1',
        email: 'new@b.com',
        role: 'user',
        passwordHash: 'hash',
        createdAt: new Date(),
      } as User;
      usersService.create.mockResolvedValue(user);

      const result = await service.createUser({ email: 'new@b.com', password: 'senha1234' });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({ id: '1', email: 'new@b.com' });
    });
  });

  describe('deleteUser', () => {
    it('should call remove on user service', async () => {
      const user = { id: '1' } as User;
      usersService.findById.mockResolvedValue(user);
      usersService.remove.mockResolvedValue();

      await service.deleteUser('1');
      expect(usersService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.deleteUser('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
