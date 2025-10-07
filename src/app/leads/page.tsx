import Leads from './components/leads';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }  
  
  return <Leads />;
}
