import { Injectable } from '@nestjs/common';
import { ReportsService } from '../reports/reports.service';
import { FlagType } from '../common/enums/flag-type.enum';
import { ContactType } from '../common/enums/contact-type.enum';
import { hashContact } from '../common/utils/contact-hasher.util';

type RiskLevel = 'alto' | 'medio' | 'baixo';

const HIGH_RISK_FLAGS: FlagType[] = [FlagType.TENTATIVA_GOLPE, FlagType.COMPORTAMENTO_AGRESSIVO];

const RECOMMENDATIONS: Record<FlagType, string[]> = {
  [FlagType.TENTATIVA_GOLPE]: [
    'Evite pagamento antecipado.',
    'Confirme a identidade antes do encontro.',
  ],
  [FlagType.COMPORTAMENTO_AGRESSIVO]: [
    'Informe sua localização para alguém de confiança.',
    'Tenha um plano de saída definido.',
  ],
  [FlagType.NAO_COMPARECEU]: [
    'Confirme o encontro por mensagem antes de sair.',
    'Peça sinal antes de se deslocar.',
  ],
  [FlagType.PERDA_DE_TEMPO]: ['Confirme o encontro no dia com antecedência mínima de 1 hora.'],
  [FlagType.PAGAMENTO_RECUSADO]: ['Não forneça o serviço sem confirmação de pagamento.'],
  [FlagType.PRESSAO_SEM_CAMISINHA]: [
    'Nunca negocie o uso de preservativo.',
    'Encerre o encontro se houver pressão.',
  ],
};

function computeRiskLevel(reportCount: number, flags: FlagType[]): RiskLevel {
  const hasHighRisk = flags.some((f) => HIGH_RISK_FLAGS.includes(f));
  if (reportCount >= 5 || hasHighRisk) return 'alto';
  if (reportCount >= 2) return 'medio';
  return 'baixo';
}

function computeRecommendations(flags: FlagType[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const flag of flags) {
    for (const rec of RECOMMENDATIONS[flag] ?? []) {
      if (!seen.has(rec)) {
        seen.add(rec);
        result.push(rec);
      }
    }
  }
  return result;
}

@Injectable()
export class ContactsService {
  constructor(private readonly reportsService: ReportsService) {}

  async lookup(contact: string, contactType: ContactType) {
    // Converte para hash — o dado bruto nunca é consultado no banco
    const contactHash = hashContact(contact, contactType);
    const reports = await this.reportsService.findByContactHash(contactHash, contactType);

    if (reports.length === 0) {
      return { found: false };
    }

    const allFlags = [...new Set(reports.flatMap((r) => r.flags))] as FlagType[];
    const riskLevel = computeRiskLevel(reports.length, allFlags);
    const recommendations = computeRecommendations(allFlags);
    const lastReportDate = reports[0].createdAt;

    return {
      found: true,
      contactType,
      riskLevel,
      reportCount: reports.length,
      flags: allFlags,
      lastReportDate,
      recommendations,
      // contactHash NÃO é retornado — evita exposição desnecessária
    };
  }
}
