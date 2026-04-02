'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  contactType: string;
  flags: string[];
  description: string | null;
  active: boolean;
  userEmail: string | null;
  createdAt: string;
}

const FLAG_LABELS: Record<string, string> = {
  tentativa_golpe: 'Golpe',
  comportamento_agressivo: 'Agressivo',
  nao_compareceu: 'Não Compareceu',
  perda_de_tempo: 'Perda de Tempo',
  pagamento_recusado: 'Pgto Recusado',
  pressao_sem_camisinha: 'S/ Camisinha',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (activeFilter !== '') params.set('active', activeFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReports(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function softDelete(id: string) {
    if (!confirm('Desativar este relato?')) return;
    await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
    load();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>
          Relatos{' '}
          <span className="text-base font-normal" style={{ color: '#9887B8' }}>
            ({total})
          </span>
        </h1>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ border: '1.5px solid #E0D8F4', background: '#F0ECFF', color: '#2E1B6E' }}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E0D8F4' }}>
        <table className="w-full text-sm" style={{ background: '#FFFFFF' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E0D8F4', background: '#F9F7FF' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>
                Tipo
              </th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>
                Flags
              </th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>
                Usuário
              </th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>
                Status
              </th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>
                Data
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8" style={{ color: '#9887B8' }}>
                  Carregando...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8" style={{ color: '#9887B8' }}>
                  Nenhum relato encontrado.
                </td>
              </tr>
            ) : (
              reports.map((r, i) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #F0ECFF' : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#2E1B6E' }}>
                    {r.contactType}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.flags.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#F0ECFF', color: '#7B52B8' }}
                        >
                          {FLAG_LABELS[f] ?? f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#9887B8' }}>
                    {r.userEmail ?? <em>anônimo</em>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={
                        r.active
                          ? { background: '#D1FAE5', color: '#059669' }
                          : { background: '#FEE2E2', color: '#DC2626' }
                      }
                    >
                      {r.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#9887B8' }}>
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Link
                      href={`/admin/reports/${r.id}`}
                      className="text-xs px-3 py-1 rounded-lg font-medium"
                      style={{ background: '#F0ECFF', color: '#7B52B8' }}
                    >
                      Ver
                    </Link>
                    {r.active && (
                      <button
                        onClick={() => softDelete(r.id)}
                        className="text-xs px-3 py-1 rounded-lg font-medium"
                        style={{ background: '#FEE2E2', color: '#DC2626' }}
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ background: '#F0ECFF', color: '#7B52B8' }}
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: '#9887B8' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ background: '#F0ECFF', color: '#7B52B8' }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
