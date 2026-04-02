'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const TYPES = [
  { value: 'phone', label: 'Telefone', icon: '📞', placeholder: '(47) 99999-9999' },
  { value: 'telegram', label: 'Telegram', icon: '✈️', placeholder: '@usuário' },
  { value: 'instagram', label: 'Instagram', icon: '📷', placeholder: '@perfil' },
  { value: 'email', label: 'E-mail', icon: '✉️', placeholder: 'email@exemplo.com' },
] as const;

const FLAGS = [
  { value: 'tentativa_golpe', label: 'Tentativa de Golpe' },
  { value: 'comportamento_agressivo', label: 'Comportamento Agressivo' },
  { value: 'nao_compareceu', label: 'Não Compareceu' },
  { value: 'perda_de_tempo', label: 'Perda de Tempo' },
  { value: 'pagamento_recusado', label: 'Pagamento Recusado' },
  { value: 'pressao_sem_camisinha', label: 'Pressão Sem Camisinha' },
] as const;

type ContactType = (typeof TYPES)[number]['value'];
type FlagValue = (typeof FLAGS)[number]['value'];

interface Props {
  userEmail: string;
}

export default function RelatoPage({ userEmail }: Props) {
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [contact, setContact] = useState('');
  const [flags, setFlags] = useState<FlagValue[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentType = TYPES.find((t) => t.value === contactType)!;

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function handleContactChange(v: string) {
    if (contactType === 'phone') setContact(formatPhone(v));
    else if (contactType === 'telegram' || contactType === 'instagram')
      setContact(v.replace(/^@+/, ''));
    else setContact(v);
  }

  function handleTypeChange(type: ContactType) {
    setContactType(type);
    setContact('');
  }

  function toggleFlag(flag: FlagValue) {
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (flags.length === 0) {
      setError('Selecione ao menos um tipo de ocorrência.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          contactType,
          flags,
          description: description || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? 'Erro ao enviar relato.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: '#F5F0FF' }}
      >
        <div
          className="w-full max-w-sm mx-auto rounded-2xl shadow-xl p-10 flex flex-col items-center gap-5 text-center"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: '#D1FAE5' }}
          >
            ✅
          </div>
          <p className="text-xl font-bold" style={{ color: '#2E1B6E' }}>
            Relato enviado!
          </p>
          <p className="text-sm" style={{ color: '#9887B8' }}>
            Agradecemos a sua contribuição.
            <br />
            Unidas vamos proteger todas nós. ♥
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center px-4 py-8"
      style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F0FF' }}
    >
      <div className="w-full max-w-lg">
        <p className="text-xs mb-6" style={{ color: '#9887B8' }}>
          Postando como{' '}
          <span className="font-semibold" style={{ color: '#7B52B8' }}>
            {userEmail}
          </span>
        </p>
      </div>
      <main className="w-full max-w-lg flex flex-col gap-6">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>
              Novo Relato
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9887B8' }}>
              Seu relato ficará vinculado à sua conta para garantir responsabilidade.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Tipo de contato */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                Tipo de contato
              </label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTypeChange(value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={
                      contactType === value
                        ? {
                            background: '#8B6FC4',
                            color: '#FFF',
                            border: '1.5px solid #8B6FC4',
                          }
                        : {
                            background: '#FFF',
                            color: '#9887B8',
                            border: '1.5px solid #E0D8F4',
                          }
                    }
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                Contato
              </label>
              <div
                className="flex items-center rounded-xl px-4 gap-2"
                style={{ border: '1.5px solid #E0D8F4', background: '#F0ECFF' }}
              >
                {(contactType === 'telegram' || contactType === 'instagram') && (
                  <span className="text-base font-bold" style={{ color: '#8B6FC4' }}>
                    @
                  </span>
                )}
                <input
                  type={contactType === 'email' ? 'email' : 'text'}
                  inputMode={contactType === 'phone' ? 'numeric' : undefined}
                  required
                  value={contact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  placeholder={currentType.placeholder}
                  autoComplete="off"
                  className="flex-1 py-3.5 bg-transparent outline-none text-sm"
                  style={{ color: '#2E1B6E' }}
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                Tipo de ocorrência <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E0D8F4' }}>
                {FLAGS.map(({ value, label }, i) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-purple-50"
                    style={i > 0 ? { borderTop: '1px solid #F0ECFF' } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={flags.includes(value)}
                      onChange={() => toggleFlag(value)}
                      className="w-4 h-4 rounded accent-purple-600"
                    />
                    <span className="text-sm" style={{ color: '#2E1B6E' }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                Descrição <span style={{ color: '#9887B8' }}>(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que aconteceu..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                style={{
                  background: '#F0ECFF',
                  border: '1.5px solid #E0D8F4',
                  color: '#2E1B6E',
                }}
              />
              <p className="text-xs text-right" style={{ color: '#C4B5D8' }}>
                {description.length}/500
              </p>
            </div>

            {/* Aviso de responsabilidade */}
            <div
              className="rounded-xl px-4 py-3 flex gap-3"
              style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
            >
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                Este relato ficará vinculado à sua conta. Relatos falsos ou caluniosos podem
                resultar em responsabilização civil.
              </p>
            </div>

            {error && (
              <p
                className="text-xs text-center rounded-lg px-3 py-2"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !contact.trim()}
              className="w-full py-4 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
            >
              {loading ? 'Enviando...' : '📢 Publicar Relato'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
