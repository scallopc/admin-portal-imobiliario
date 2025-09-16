import PropertyClient from './components/property-client';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PropertyPage() {
  const session = await getSession();
  
  if (!session.user?.id) {
    redirect('/authentication');
  }
  
  return <PropertyClient />;
}
