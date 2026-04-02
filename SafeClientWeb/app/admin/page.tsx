import { cookies } from 'next/headers';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

async function getStats(token: string) {
  try {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const store = await cookies();
  const token = store.get('safeclient_token')?.value ?? '';
  const stats = await getStats(token);

  const cards = [
    { label: 'Total de Relatos', value: stats?.totalReports ?? '—', color: '#7B52B8', bg: '#F0ECFF' },
    { label: 'Relatos Ativos', value: stats?.activeReports ?? '—', color: '#059669', bg: '#D1FAE5' },
    { label: 'Relatos Inativos', value: stats?.inactiveReports ?? '—', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Usuários', value: stats?.totalUsers ?? '—', color: '#2563EB', bg: '#DBEAFE' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-6 flex flex-col gap-2"
            style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}>
            <p className="text-xs font-semibold" style={{ color: '#9887B8' }}>{c.label}</p>
            <p className="text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}>
        <p className="text-sm" style={{ color: '#9887B8' }}>
          Bem-vindo ao painel de administração SafeClient. Use o menu lateral para gerenciar relatos e usuários.
        </p>
      </div>
    </div>
  );
}
