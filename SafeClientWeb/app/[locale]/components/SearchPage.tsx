'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';

interface Props {
  userEmail: string | null;
}

export default function SearchPage({ userEmail: _userEmail }: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [contact, setContact] = useState('');

  const TYPES = [
    { value: 'phone' as ContactType, label: t('typePhone'), icon: '📞', placeholder: t('phonePlaceholder') },
    { value: 'telegram' as ContactType, label: t('typeTelegram'), icon: '✈️', placeholder: t('telegramPlaceholder') },
    { value: 'instagram' as ContactType, label: t('typeInstagram'), icon: '📷', placeholder: t('instagramPlaceholder') },
    { value: 'email' as ContactType, label: t('typeEmail'), icon: '✉️', placeholder: t('emailPlaceholder') },
  ];

  const currentType = TYPES.find((tp) => tp.value === contactType)!;

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function handleChange(v: string) {
    if (contactType === 'phone') setContact(formatPhone(v));
    else if (contactType === 'telegram' || contactType === 'instagram') setContact(v.replace(/^@+/, ''));
    else setContact(v);
  }

  function handleTypeChange(type: ContactType) {
    setContactType(type);
    setContact('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    const params = new URLSearchParams({ contact, contactType });
    router.push(`/resultado?${params}`);
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-16"
      style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F0FF' }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-50" style={{ background: '#DDD4F0' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: '#DDD4F0' }} />
      </div>

      <div className="relative w-full max-w-xl flex flex-col items-center gap-8" style={{ zIndex: 1 }}>
        <img src="/logo.png" alt="SafeClient" className="w-72 h-auto drop-shadow-lg" />

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl shadow-xl p-8 flex flex-col gap-5"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}
        >
          <p className="text-sm font-semibold text-center" style={{ color: '#9887B8' }}>
            {t('subtitle')}
          </p>

          <div className="flex gap-2 flex-wrap">
            {TYPES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleTypeChange(value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  contactType === value
                    ? { background: '#8B6FC4', color: '#FFFFFF', border: '1.5px solid #8B6FC4' }
                    : { background: '#FFFFFF', color: '#9887B8', border: '1.5px solid #E0D8F4' }
                }
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div
            className="flex items-center rounded-xl px-4 gap-2"
            style={{ border: '1.5px solid #E0D8F4', background: '#F0ECFF' }}
          >
            {(contactType === 'telegram' || contactType === 'instagram') && (
              <span className="text-lg font-bold" style={{ color: '#8B6FC4' }}>@</span>
            )}
            <input
              type={contactType === 'email' ? 'email' : 'text'}
              inputMode={contactType === 'phone' ? 'numeric' : undefined}
              value={contact}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={currentType.placeholder}
              autoComplete="off"
              className="flex-1 py-4 bg-transparent outline-none text-base"
              style={{ color: '#2E1B6E' }}
            />
          </div>

          <button
            type="submit"
            disabled={!contact.trim()}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
          >
            {t('analyze')}
          </button>

          <p className="text-center text-xs" style={{ color: '#9887B8' }}>
            {t('privacy')}
          </p>
        </form>

        <p className="text-xs text-center" style={{ color: '#9887B8' }}>
          {t('footer')}
        </p>
      </div>
    </div>
  );
}
