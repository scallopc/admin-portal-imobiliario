import Links from './components/links';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LinksPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }
  
  return <Links />;
}


