import LeadsClient from './components/leads-client';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }  
  
  return <LeadsClient />;
}
