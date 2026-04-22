import { Suspense } from 'react';
import { isDocsAuthenticated } from '@/lib/docs/auth';
import DocsLoginGate from './DocsLoginGate';

export const dynamic = 'force-dynamic';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isDocsAuthenticated();

  if (!authenticated) {
    return (
      <Suspense>
        <DocsLoginGate />
      </Suspense>
    );
  }

  return <>{children}</>;
}
