import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FollowUp from './components/schedule';

export default async function FollowUpPage() {
  const session = await getSession();

  if (!session.user?.id) {
    redirect('/authentication');
  }

  return <FollowUp />;
}
