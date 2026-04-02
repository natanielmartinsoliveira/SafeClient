'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const FLAGS = [
  { value: 'tentativa_golpe', label: 'Tentativa de Golpe' },
  { value: 'comportamento_agressivo', label: 'Comportamento Agressivo' },
  { value: 'nao_compareceu', label: 'Não Compareceu' },
  { value: 'perda_de_tempo', label: 'Perda de Tempo' },
  { value: 'pagamento_recusado', label: 'Pagamento Recusado' },
  { value: 'pressao_sem_camisinha', label: 'Pressão Sem Camisinha' },
];

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/reports/${id}`).then((r) => r.json()).then((data) => {
      setReport(data);
      setFlags(data.flags ?? []);
      setDescription(data.description ?? '');
      setActive(data.active ?? true);
      setLoading(false);
    });
  }, [id]);

  function toggleFlag(f: string) {
    setFlags((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flags, description: description || undefined, active }),
    });
    setSaving(false);
    if (res.ok) router.push('/admin/reports');
    else setError('Erro ao salvar.');
  }

  if (loading) return <p style={{ color: '#9887B8' }}>Carregando...</p>;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm" style={{ color: '#9887B8' }}>← Voltar</button>
        <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>Editar Relato</h1>
      </div>

      <div className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}>

        <div className="text-xs" style={{ color: '#9887B8' }}>
          <p>Tipo: <strong style={{ color: '#2E1B6E' }}>{report.contactType}</strong></p>
          <p>Criado em: <strong style={{ color: '#2E1B6E' }}>{new Date(report.createdAt).toLocaleString('pt-BR')}</strong></p>
          {report.userEmail && <p>Autor: <strong style={{ color: '#2E1B6E' }}>{report.userEmail}</strong></p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>Flags</label>
          {FLAGS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={flags.includes(value)} onChange={() => toggleFlag(value)}
                className="w-4 h-4 accent-purple-600" />
              <span className="text-sm" style={{ color: '#2E1B6E' }}>{label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} maxLength={500}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
            style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-purple-600" />
          <span className="text-sm font-medium" style={{ color: '#2E1B6E' }}>Relato ativo</span>
        </label>

        {error && <p className="text-xs text-center rounded-lg px-3 py-2"
          style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  );
}
