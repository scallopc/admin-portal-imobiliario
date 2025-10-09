import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Dashboard from './components/dashboard';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }
  
  return <Dashboard />;
}   