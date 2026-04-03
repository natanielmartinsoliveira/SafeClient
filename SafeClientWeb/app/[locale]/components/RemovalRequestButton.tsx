'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  contact: string;
  contactType: string;
}

export default function RemovalRequestButton({ contact, contactType }: Props) {
  const t = useTranslations('Removal');
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/removal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, contactType, reason: reason || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
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
        className="rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <span className="text-xl flex-shrink-0">✅</span>
        <div>
          <p className="text-sm font-bold text-white">{t('successTitle')}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('successMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🗑️</span>
          <div>
            <p className="text-sm font-semibold text-white">{t('title')}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('subtitle')}
            </p>
          </div>
        </div>
        <span className="text-white text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Expandable form */}
      {open && (
        <div
          className="px-5 pb-5 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {t('warning')}
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('reasonPlaceholder')}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          />
          <p className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {reason.length}/500
          </p>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2 text-center"
              style={{ background: 'rgba(220,38,38,0.3)', color: '#FCA5A5' }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'rgba(220,38,38,0.55)', border: '1px solid rgba(220,38,38,0.7)' }}
          >
            {loading ? t('loading') : t('submit')}
          </button>
        </div>
      )}
    </div>
  );
}
