'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';

interface Props {
  userEmail: string | null;
}

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

export default function SearchPage({ userEmail: _userEmail }: Props) {
  const t = useTranslations('Search');
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [contact, setContact] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  const TYPES = [
    {
      value: 'phone' as ContactType,
      label: t('typePhone'),
      icon: '📞',
      placeholder: t('phonePlaceholder'),
    },
    {
      value: 'telegram' as ContactType,
      label: t('typeTelegram'),
      icon: '✈️',
      placeholder: t('telegramPlaceholder'),
    },
    {
      value: 'instagram' as ContactType,
      label: t('typeInstagram'),
      icon: '📷',
      placeholder: t('instagramPlaceholder'),
    },
    {
      value: 'email' as ContactType,
      label: t('typeEmail'),
      icon: '✉️',
      placeholder: t('emailPlaceholder'),
    },
  ];

  const currentType = TYPES.find((tp) => tp.value === contactType)!;

  function handleChange(v: string) {
    setFieldError('');
    if (contactType === 'telegram' || contactType === 'instagram') setContact(v.replace(/^@+/, ''));
    else setContact(v);
  }

  function handleTypeChange(type: ContactType) {
    setContactType(type);
    setContact('');
    setFieldError('');
  }

  function getErrorKey(): string {
    switch (contactType) {
      case 'phone':
        return 'errorPhone';
      case 'telegram':
      case 'instagram':
        return 'errorHandle';
      case 'email':
        return 'errorEmail';
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    if (!validateContact(contact, contactType)) {
      setFieldError(t(getErrorKey()));
      return;
    }
    setLoading(true);
    setPressed(true);
    const rawContact = contact.trim();
    const params = new URLSearchParams({ contact: rawContact, contactType });
    router.push(`/resultado?${params}`);
  }

  const canSubmit = contact.trim().length > 0 && !loading;

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6"
      style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F0FF' }}
    >
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-50"
          style={{ background: '#DDD4F0' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: '#DDD4F0' }}
        />
      </div>

      <div
        className="relative w-full max-w-xl flex flex-col items-center gap-6"
        style={{ zIndex: 1 }}
      >
        {/* Logo + powered by */}
        <div className="flex flex-col items-center gap-2">
          <img src="/logo.png" alt="SafeClient" className="w-72 h-auto drop-shadow-lg" />
          <p
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: '#A994CC', letterSpacing: '0.08em' }}
          >
            {t('poweredBy')}
          </p>
        </div>

        {/* Social proof badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)',
            color: '#FFFFFF',
          }}
        >
          <span>✨</span>
          {t('socialProof')}
        </div>

        {/* Main card */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl shadow-xl p-8 flex flex-col gap-5"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}
        >
          <p className="text-sm font-semibold text-center" style={{ color: '#9887B8' }}>
            {t('subtitle')}
          </p>

          {/* Contact type tabs */}
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

          {/* Input */}
          <div className="flex flex-col gap-1.5">
            <div
              className="flex items-center rounded-xl px-4 gap-2 transition-all"
              style={{
                border: fieldError ? '1.5px solid #DC2626' : '1.5px solid #E0D8F4',
                background: '#F0ECFF',
              }}
            >
              {(contactType === 'telegram' || contactType === 'instagram') && (
                <span className="text-lg font-bold" style={{ color: '#8B6FC4' }}>
                  @
                </span>
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
            {fieldError && (
              <p className="text-xs px-1" style={{ color: '#DC2626' }}>
                {fieldError}
              </p>
            )}
          </div>

          {/* Analyze button */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-40 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)',
                transform: pressed && canSubmit ? 'scale(0.98)' : 'scale(1)',
                transition: 'transform 0.1s ease, box-shadow 0.2s ease',
                boxShadow:
                  canSubmit && !pressed
                    ? '0 4px 20px rgba(139,111,196,0.45)'
                    : '0 2px 8px rgba(139,111,196,0.2)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {t('analyze')}
                </span>
              ) : (
                t('analyze')
              )}
            </button>
            <p className="text-center text-xs" style={{ color: '#B0A0CC' }}>
              {t('analyzeHint')}
            </p>
          </div>

          {/* Privacy row */}
          <p className="text-center text-xs" style={{ color: '#9887B8' }}>
            {t('privacy')}
          </p>
        </form>

        {/* Privacy mini-block */}
        <div
          className="w-full rounded-xl px-5 py-4 flex flex-col gap-2"
          style={{ background: '#EDE8FA', border: '1px solid #D4CAF0' }}
        >
          <p className="text-xs font-bold" style={{ color: '#5C3D9E' }}>
            {t('privacyTitle')}
          </p>
          <ul className="flex flex-col gap-1">
            {(['privacyBullet1', 'privacyBullet2', 'privacyBullet3'] as const).map((key) => (
              <li
                key={key}
                className="flex items-center gap-2 text-xs"
                style={{ color: '#6B5B9E' }}
              >
                <span style={{ color: '#8B6FC4' }}>✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-center" style={{ color: '#9887B8' }}>
          {t('footer')}
        </p>
      </div>
    </div>
  );
}
