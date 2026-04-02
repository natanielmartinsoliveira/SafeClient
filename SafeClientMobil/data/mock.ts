export type RiskLevel = 'alto' | 'medio' | 'baixo';
export type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';

export type FlagType =
  | 'tentativa_golpe'
  | 'comportamento_agressivo'
  | 'nao_compareceu'
  | 'perda_de_tempo'
  | 'pagamento_recusado'
  | 'pressao_sem_camisinha';

export const FLAG_LABELS: Record<FlagType, string> = {
  tentativa_golpe: 'Tentativa de Golpe',
  comportamento_agressivo: 'Comportamento Agressivo',
  nao_compareceu: 'Não Compareceu',
  perda_de_tempo: 'Perda de Tempo',
  pagamento_recusado: 'Pagamento Recusado',
  pressao_sem_camisinha: 'Pressão Sem Camisinha',
};

export interface ClientReport {
  id: string;
  contact: string;
  contactType: ContactType;
  riskLevel: RiskLevel;
  flags: FlagType[];
  reportCount: number;
  lastReportDate: string;
  recommendations: string[];
}

export const MOCK_CLIENTS: ClientReport[] = [
  {
    id: '1',
    contact: '47991234567',
    contactType: 'phone',
    riskLevel: 'alto',
    flags: ['tentativa_golpe', 'comportamento_agressivo', 'nao_compareceu'],
    reportCount: 7,
    lastReportDate: '2024-03-10',
    recommendations: [
      'Evite pagamento antecipado.',
      'Confirme a identidade antes do encontro.',
      'Informe sua localização para alguém de confiança.',
    ],
  },
  {
    id: '2',
    contact: '11987654321',
    contactType: 'phone',
    riskLevel: 'medio',
    flags: ['nao_compareceu', 'perda_de_tempo'],
    reportCount: 3,
    lastReportDate: '2024-02-20',
    recommendations: [
      'Confirme o encontro por mensagem antes de sair.',
      'Peça sinal antes de se deslocar.',
    ],
  },
  {
    id: '3',
    contact: '21955443322',
    contactType: 'phone',
    riskLevel: 'baixo',
    flags: ['nao_compareceu'],
    reportCount: 1,
    lastReportDate: '2024-01-15',
    recommendations: ['Confirme o encontro novamente antes de sair.'],
  },
  {
    id: '4',
    contact: 'joao_silva99',
    contactType: 'telegram',
    riskLevel: 'alto',
    flags: ['tentativa_golpe', 'pagamento_recusado'],
    reportCount: 5,
    lastReportDate: '2024-03-15',
    recommendations: [
      'Não faça pagamentos antecipados por Pix ou transferência.',
      'Desconfie de perfis sem foto verificada.',
      'Bloqueie e reporte o perfil no Telegram.',
    ],
  },
  {
    id: '5',
    contact: 'pedro.encontros',
    contactType: 'instagram',
    riskLevel: 'medio',
    flags: ['nao_compareceu', 'perda_de_tempo'],
    reportCount: 2,
    lastReportDate: '2024-03-01',
    recommendations: [
      'Verifique se o perfil tem histórico de publicações.',
      'Confirme o encontro no dia pelo Instagram.',
    ],
  },
  {
    id: '6',
    contact: 'cliente@exemplo.com',
    contactType: 'email',
    riskLevel: 'baixo',
    flags: ['nao_compareceu'],
    reportCount: 1,
    lastReportDate: '2024-02-10',
    recommendations: ['Confirme o encontro por e-mail antes de se deslocar.'],
  },
];

export const SAFE_LOCATIONS = [
  {
    id: '1',
    name: 'UPA Centro',
    type: 'Saúde',
    address: 'Rua das Flores, 123 - Centro',
    distance: '0,8 km',
  },
  {
    id: '2',
    name: 'Delegacia da Mulher',
    type: 'Segurança',
    address: 'Av. Principal, 456 - Centro',
    distance: '1,2 km',
  },
  {
    id: '3',
    name: 'Centro de Apoio à Mulher',
    type: 'Apoio',
    address: 'Rua da Paz, 789 - Bairro Alto',
    distance: '2,1 km',
  },
];

export const SAFETY_TIPS = [
  'Sempre avise alguém de confiança sobre onde você está.',
  'Mantenha o celular carregado antes dos encontros.',
  'Combine uma palavra-código com uma amiga para situações de perigo.',
  'Faça check-in antes e depois dos encontros.',
  'Confie no seu instinto — se algo parecer errado, cancele.',
];

export function lookupContact(contact: string, contactType: ContactType): ClientReport | null {
  const normalized = contactType === 'phone'
    ? contact.replace(/\D/g, '')
    : contact.replace(/^@/, '').toLowerCase().trim();

  return (
    MOCK_CLIENTS.find((c) => {
      if (c.contactType !== contactType) return false;
      const stored = contactType === 'phone'
        ? c.contact
        : c.contact.toLowerCase();
      return stored === normalized;
    }) ?? null
  );
}
