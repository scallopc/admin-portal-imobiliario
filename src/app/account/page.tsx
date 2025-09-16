import AccountClient from './components/account-client';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }
  
  return <AccountClient />;
}
