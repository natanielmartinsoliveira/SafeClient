'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

function validateContact(contact: string, type: ContactType): boolean {
  switch (type) {
    case 'phone': {
      const digits = contact.replace(/[\s\-().+]/g, '');
      return /^\d{7,15}$/.test(digits);
    }
    case 'telegram':
    case 'instagram':
      return /^[a-zA-Z0-9._]{1,50}$/.test(contact.trim());
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
  }
}

type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';
type FlagValue =
  | 'tentativa_golpe'
  | 'comportamento_agressivo'
  | 'nao_compareceu'
  | 'perda_de_tempo'
  | 'pagamento_recusado'
  | 'pressao_sem_camisinha';

interface Props {
  userEmail: string;
}

export default function RelatoPage({ userEmail }: Props) {
  const t = useTranslations('Relato');
  const tf = useTranslations('Flags');
  const ts = useTranslations('Search');
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [contact, setContact] = useState('');
  const [flags, setFlags] = useState<FlagValue[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [contactError, setContactError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const TYPES = [
    {
      value: 'phone' as ContactType,
      label: ts('typePhone'),
      icon: '📞',
      placeholder: ts('phonePlaceholder'),
    },
    {
      value: 'telegram' as ContactType,
      label: ts('typeTelegram'),
      icon: '✈️',
      placeholder: ts('telegramPlaceholder'),
    },
    {
      value: 'instagram' as ContactType,
      label: ts('typeInstagram'),
      icon: '📷',
      placeholder: ts('instagramPlaceholder'),
    },
    {
      value: 'email' as ContactType,
      label: ts('typeEmail'),
      icon: '✉️',
      placeholder: ts('emailPlaceholder'),
    },
  ];

  const FLAGS: { value: FlagValue; label: string }[] = [
    { value: 'tentativa_golpe', label: tf('tentativa_golpe') },
    { value: 'comportamento_agressivo', label: tf('comportamento_agressivo') },
    { value: 'nao_compareceu', label: tf('nao_compareceu') },
    { value: 'perda_de_tempo', label: tf('perda_de_tempo') },
    { value: 'pagamento_recusado', label: tf('pagamento_recusado') },
    { value: 'pressao_sem_camisinha', label: tf('pressao_sem_camisinha') },
  ];

  const currentType = TYPES.find((tp) => tp.value === contactType)!;

  function handleContactChange(v: string) {
    setContactError('');
    if (contactType === 'telegram' || contactType === 'instagram') setContact(v.replace(/^@+/, ''));
    else setContact(v);
  }

  function handleTypeChange(type: ContactType) {
    setContactType(type);
    setContact('');
    setContactError('');
  }

  function toggleFlag(flag: FlagValue) {
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setContactError('');
    if (!validateContact(contact, contactType)) {
      const contactErrorMsg =
        contactType === 'phone'
          ? ts('errorPhone')
          : contactType === 'email'
            ? ts('errorEmail')
            : ts('errorHandle');
      setContactError(contactErrorMsg);
      return;
    }
    if (flags.length === 0) {
      setError(t('errorNoFlag'));
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
        setError(data?.message ?? t('errorDefault'));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('errorConnection'));
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
            {t('successTitle')}
          </p>
          <p className="text-sm" style={{ color: '#9887B8' }}>
            {t('successMessage')}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
          >
            {t('backHome')}
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
          {t('postingAs')}{' '}
          <span className="font-semibold" style={{ color: '#7B52B8' }}>
            {userEmail}
          </span>
        </p>
      </div>
      <main className="w-full max-w-lg flex flex-col gap-6">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>
              {t('title')}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9887B8' }}>
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                {t('contactTypeLabel')}
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
                        ? { background: '#8B6FC4', color: '#FFF', border: '1.5px solid #8B6FC4' }
                        : { background: '#FFF', color: '#9887B8', border: '1.5px solid #E0D8F4' }
                    }
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                {t('contactLabel')}
              </label>
              <div
                className="flex items-center rounded-xl px-4 gap-2 transition-all"
                style={{
                  border: contactError ? '1.5px solid #DC2626' : '1.5px solid #E0D8F4',
                  background: '#F0ECFF',
                }}
              >
                {(contactType === 'telegram' || contactType === 'instagram') && (
                  <span className="text-base font-bold" style={{ color: '#8B6FC4' }}>
                    @
                  </span>
                )}
                <input
                  type={contactType === 'email' ? 'email' : 'text'}
                  inputMode={contactType === 'phone' ? 'numeric' : undefined}
                  value={contact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  placeholder={currentType.placeholder}
                  autoComplete="off"
                  className="flex-1 py-3.5 bg-transparent outline-none text-sm"
                  style={{ color: '#2E1B6E' }}
                />
              </div>
              {contactError && (
                <p className="text-xs px-1" style={{ color: '#DC2626' }}>
                  {contactError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                {t('occurrenceLabel')} <span style={{ color: '#DC2626' }}>*</span>
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>
                {t('descLabel')} <span style={{ color: '#9887B8' }}>{t('descOptional')}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descPlaceholder')}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }}
              />
              <p className="text-xs text-right" style={{ color: '#C4B5D8' }}>
                {description.length}/500
              </p>
            </div>

            <div
              className="rounded-xl px-4 py-3 flex gap-3"
              style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
            >
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                {t('warningText')}
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
              {loading ? t('loading') : t('submit')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
