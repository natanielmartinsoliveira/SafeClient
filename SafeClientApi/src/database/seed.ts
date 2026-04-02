/**
 * Seed script — insere dados de teste no banco de dados.
 * Uso: npm run seed
 * (dentro do container: docker compose exec api npm run seed)
 */

import 'reflect-metadata';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

// Carrega .env manualmente (sem depender de dotenv instalado)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const CONTACT_HASH_SECRET = process.env.CONTACT_HASH_SECRET;
if (!CONTACT_HASH_SECRET) {
  console.error('❌  CONTACT_HASH_SECRET não definido.');
  process.exit(1);
}

// ─── Utilitários (inline para evitar imports de TS com decorators) ───────────

type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';
type FlagType =
  | 'perda_de_tempo'
  | 'tentativa_golpe'
  | 'comportamento_agressivo'
  | 'nao_compareceu'
  | 'pagamento_recusado'
  | 'pressao_sem_camisinha';

function normalizeContact(contact: string, type: ContactType): string {
  switch (type) {
    case 'phone':
      return contact.replace(/\D/g, '');
    case 'telegram':
    case 'instagram':
      return contact.replace(/^@+/, '').toLowerCase().trim();
    case 'email':
      return contact.toLowerCase().trim();
    default:
      return contact.trim();
  }
}

function hashContact(contact: string, type: ContactType): string {
  const normalized = normalizeContact(contact, type);
  return crypto.createHmac('sha256', CONTACT_HASH_SECRET!).update(normalized).digest('hex');
}

function randomUuid(): string {
  return crypto.randomUUID();
}

// ─── Dados de teste ───────────────────────────────────────────────────────────

interface SeedReport {
  contact: string;
  contactType: ContactType;
  flags: FlagType[];
  description?: string;
  daysAgo?: number;
}

const SEED_REPORTS: SeedReport[] = [
  // ── Alto risco: telefone com muitos reportes ──
  {
    contact: '47991234567',
    contactType: 'phone',
    flags: ['tentativa_golpe', 'comportamento_agressivo'],
    description: 'Tentou aplicar golpe do pix, ficou agressivo ao ser recusado.',
    daysAgo: 30,
  },
  {
    contact: '47991234567',
    contactType: 'phone',
    flags: ['tentativa_golpe', 'pagamento_recusado'],
    description: 'Pix cancelado após o serviço.',
    daysAgo: 20,
  },
  {
    contact: '47991234567',
    contactType: 'phone',
    flags: ['comportamento_agressivo', 'pressao_sem_camisinha'],
    daysAgo: 15,
  },
  {
    contact: '47991234567',
    contactType: 'phone',
    flags: ['nao_compareceu', 'perda_de_tempo'],
    daysAgo: 10,
  },
  {
    contact: '47991234567',
    contactType: 'phone',
    flags: ['tentativa_golpe'],
    description: 'Usou nome e foto falsos.',
    daysAgo: 5,
  },

  // ── Médio risco: telefone com poucos reportes ──
  {
    contact: '11987654321',
    contactType: 'phone',
    flags: ['nao_compareceu', 'perda_de_tempo'],
    description: 'Marcou e não apareceu, sem avisar.',
    daysAgo: 14,
  },
  {
    contact: '11987654321',
    contactType: 'phone',
    flags: ['nao_compareceu'],
    daysAgo: 7,
  },
  {
    contact: '11987654321',
    contactType: 'phone',
    flags: ['pagamento_recusado'],
    description: 'Tentou negociar o valor depois de combinar.',
    daysAgo: 2,
  },

  // ── Baixo risco: telefone com um reporte ──
  {
    contact: '21955443322',
    contactType: 'phone',
    flags: ['nao_compareceu'],
    description: 'Marcou e sumiu, pode ter sido engano.',
    daysAgo: 60,
  },

  // ── Alto risco: Telegram ──
  {
    contact: 'joao_silva99',
    contactType: 'telegram',
    flags: ['tentativa_golpe', 'comportamento_agressivo'],
    description: 'Perfil falso no Telegram, tenta aplicar golpe do sinal.',
    daysAgo: 10,
  },
  {
    contact: 'joao_silva99',
    contactType: 'telegram',
    flags: ['tentativa_golpe', 'pagamento_recusado'],
    daysAgo: 5,
  },
  {
    contact: 'joao_silva99',
    contactType: 'telegram',
    flags: ['pressao_sem_camisinha'],
    daysAgo: 2,
  },
  {
    contact: 'joao_silva99',
    contactType: 'telegram',
    flags: ['comportamento_agressivo'],
    description: 'Ameaçou ao ser recusado.',
    daysAgo: 1,
  },
  {
    contact: 'joao_silva99',
    contactType: 'telegram',
    flags: ['tentativa_golpe'],
    daysAgo: 0,
  },

  // ── Médio risco: Instagram ──
  {
    contact: 'pedro.encontros',
    contactType: 'instagram',
    flags: ['nao_compareceu', 'perda_de_tempo'],
    description: 'Marcou duas vezes e não apareceu.',
    daysAgo: 21,
  },
  {
    contact: 'pedro.encontros',
    contactType: 'instagram',
    flags: ['pagamento_recusado'],
    daysAgo: 8,
  },
  {
    contact: 'pedro.encontros',
    contactType: 'instagram',
    flags: ['pressao_sem_camisinha'],
    daysAgo: 3,
  },

  // ── Baixo risco: E-mail ──
  {
    contact: 'cliente@exemplo.com',
    contactType: 'email',
    flags: ['perda_de_tempo'],
    description: 'Conversas longas sem chegar a um acordo, sem má intenção aparente.',
    daysAgo: 45,
  },
];

// ─── Conexão e seed ───────────────────────────────────────────────────────────

async function main() {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    user:     process.env.DB_USER     || 'safeclient',
    password: process.env.DB_PASSWORD || 'safeclient_pass',
    database: process.env.DB_NAME     || 'safeclient_db',
  });

  await client.connect();
  console.log('✅  Conectado ao PostgreSQL.');

  // ── Upsert do usuário admin ──────────────────────────────────────────────
  const adminEmail = 'admin@safeclient.com';
  const adminPassword = 'Admin@123456';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const adminId = randomUuid();

  await client.query(
    `INSERT INTO users (id, email, "passwordHash", role, "createdAt")
     VALUES ($1, $2, $3, 'admin', NOW())
     ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
    [adminId, adminEmail, adminHash],
  );
  console.log(`👑  Admin user garantido: ${adminEmail}`);

  // Idempotência: só executa se não houver nenhum report de seed
  const { rows } = await client.query('SELECT COUNT(*) FROM reports');
  if (parseInt(rows[0].count, 10) > 0) {
    console.log('ℹ️   Banco já possui dados de reports. Seed de reports ignorado.');
    await client.end();
    return;
  }

  let inserted = 0;
  let skipped  = 0;

  for (const r of SEED_REPORTS) {
    const contactHash = hashContact(r.contact, r.contactType);
    const flagsStr    = r.flags.join(',');
    const id          = randomUuid();
    const createdAt   = new Date();
    createdAt.setDate(createdAt.getDate() - (r.daysAgo ?? 0));

    try {
      await client.query(
        `INSERT INTO reports (id, "contactHash", "contactType", flags, description, "ipHash", active, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, contactHash, r.contactType, flagsStr, r.description ?? null, null, true, createdAt],
      );
      inserted++;
      console.log(`  ➕  ${r.contactType} ${r.contact} [${r.flags.join(', ')}]`);
    } catch (err: any) {
      if (err.code === '23505') {
        skipped++;
        console.log(`  ⏭️   Duplicado, pulando: ${r.contact}`);
      } else {
        throw err;
      }
    }
  }

  await client.end();
  console.log(`\n🎉  Seed concluído: ${inserted} inseridos, ${skipped} ignorados.`);
}

main().catch((err) => {
  console.error('❌  Erro no seed:', err.message);
  process.exit(1);
});
