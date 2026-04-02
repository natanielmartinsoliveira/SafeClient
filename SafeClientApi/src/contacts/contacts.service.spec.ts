// Set required env vars before any module import
process.env.CONTACT_HASH_SECRET = 'test-secret-for-unit-tests';

import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { ReportsService } from '../reports/reports.service';
import { ContactType } from '../common/enums/contact-type.enum';
import { FlagType } from '../common/enums/flag-type.enum';
import { Report } from '../reports/report.entity';

const mockReportsService = () => ({
  findByContactHash: jest.fn(),
});

describe('ContactsService', () => {
  let service: ContactsService;
  let reportsService: jest.Mocked<ReportsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: ReportsService, useFactory: mockReportsService },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    reportsService = module.get(ReportsService);
  });

  it('should return found: false when no reports exist', async () => {
    reportsService.findByContactHash.mockResolvedValue([]);

    const result = await service.lookup('47991234567', ContactType.PHONE);
    expect(result).toEqual({ found: false });
  });

  it('should return baixo risk for 1 report with no high-risk flags', async () => {
    const reports = [
      { flags: [FlagType.NAO_COMPARECEU], createdAt: new Date() },
    ] as Report[];
    reportsService.findByContactHash.mockResolvedValue(reports);

    const result = await service.lookup('11987654321', ContactType.PHONE);
    expect(result).toMatchObject({ found: true, riskLevel: 'baixo', reportCount: 1 });
  });

  it('should return medio risk for 2–4 reports with no high-risk flags', async () => {
    const reports = Array(3).fill({
      flags: [FlagType.NAO_COMPARECEU],
      createdAt: new Date(),
    }) as Report[];
    reportsService.findByContactHash.mockResolvedValue(reports);

    const result = await service.lookup('11987654321', ContactType.PHONE);
    expect(result).toMatchObject({ found: true, riskLevel: 'medio', reportCount: 3 });
  });

  it('should return alto risk for 5+ reports', async () => {
    const reports = Array(5).fill({
      flags: [FlagType.NAO_COMPARECEU],
      createdAt: new Date(),
    }) as Report[];
    reportsService.findByContactHash.mockResolvedValue(reports);

    const result = await service.lookup('47991234567', ContactType.PHONE);
    expect(result).toMatchObject({ found: true, riskLevel: 'alto', reportCount: 5 });
  });

  it('should return alto risk for high-risk flag even with 1 report', async () => {
    const reports = [
      { flags: [FlagType.TENTATIVA_GOLPE], createdAt: new Date() },
    ] as Report[];
    reportsService.findByContactHash.mockResolvedValue(reports);

    const result = await service.lookup('99999999999', ContactType.PHONE);
    expect(result).toMatchObject({ found: true, riskLevel: 'alto', reportCount: 1 });
  });

  it('should return recommendations based on flags', async () => {
    const reports = [
      { flags: [FlagType.PAGAMENTO_RECUSADO], createdAt: new Date() },
    ] as Report[];
    reportsService.findByContactHash.mockResolvedValue(reports);

    const result = await service.lookup('test', ContactType.EMAIL);
    expect((result as any).recommendations).toContain(
      'Não forneça o serviço sem confirmação de pagamento.',
    );
  });
});
