import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RemovalRequest } from '../removal-requests/removal-request.entity';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class RemovalCronService {
  private readonly logger = new Logger(RemovalCronService.name);

  constructor(
    @InjectRepository(RemovalRequest)
    private readonly removalRepo: Repository<RemovalRequest>,
    private readonly reportsService: ReportsService,
  ) {}

  /**
   * Executa a cada 6 horas.
   * Processa solicitações de remoção pendentes:
   *   - Marca o pedido como 'approved'
   *   - Desativa (soft-delete) todos os reports do contato
   *
   * Os reports permanecem no banco. Se um novo relato chegar para o mesmo
   * contato, eles serão reativados automaticamente (ver ReportsService.create).
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async processRemovalRequests() {
    this.logger.log('Iniciando processamento de solicitações de remoção...');

    const pending = await this.removalRepo.find({
      where: { status: 'pending', processedAt: IsNull() },
    });

    if (pending.length === 0) {
      this.logger.log('Nenhuma solicitação pendente.');
      return;
    }

    let processed = 0;

    for (const req of pending) {
      await this.reportsService.deactivateByContactHash(req.contactHash, req.contactType);

      await this.removalRepo.update(req.id, {
        status: 'approved',
        processedAt: new Date(),
      });

      processed++;
      this.logger.log(
        `Remoção processada: contactType=${req.contactType} hash=${req.contactHash.slice(0, 8)}...`,
      );
    }

    this.logger.log(`Processamento concluído: ${processed} solicitação(ões) aprovada(s).`);
  }
}
