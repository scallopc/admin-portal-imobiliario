import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardClient from './components/dashboard-client';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }
  
  return <DashboardClient />;
}   