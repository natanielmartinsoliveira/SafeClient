import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-57px)]" style={{ background: '#F5F0FF' }}>

      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col gap-1 p-4 border-r"
        style={{ background: '#FFFFFF', borderColor: '#E0D8F4' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9887B8' }}>
          Painel Admin
        </p>

        <Link href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-purple-50"
          style={{ color: '#2E1B6E' }}>
          📊 Dashboard
        </Link>

        <Link href="/admin/reports"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-purple-50"
          style={{ color: '#2E1B6E' }}>
          📋 Relatos
        </Link>

        <Link href="/admin/users"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-purple-50"
          style={{ color: '#2E1B6E' }}>
          👥 Usuários
        </Link>

        <div className="mt-auto pt-4 border-t" style={{ borderColor: '#E0D8F4' }}>
          <Link href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-purple-50"
            style={{ color: '#9887B8' }}>
            ← Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
