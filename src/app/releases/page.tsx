import { Releases } from './components/releases'
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReleasesPage() {

  const session = await getSession();

  if (!session.user?.id) {
    redirect('/authentication');
  }


  return <Releases />
}
