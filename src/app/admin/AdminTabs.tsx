'use client';

import { useState } from 'react';
import { Trophy, Users } from 'lucide-react';

type Tab = 'winners' | 'history';

export default function AdminTabs({
  winnersContent,
  historyContent,
}: {
  winnersContent: React.ReactNode;
  historyContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>('winners');

  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('winners')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'winners'
              ? 'bg-[#1d3969] text-white'
              : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Ganadores semanales
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'history'
              ? 'bg-[#1d3969] text-white'
              : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
          }`}
        >
          <Users className="h-4 w-4" />
          Historial de usuarios
        </button>
      </div>

      {/* Tab content */}
      {tab === 'winners' ? winnersContent : historyContent}
    </div>
  );
}
