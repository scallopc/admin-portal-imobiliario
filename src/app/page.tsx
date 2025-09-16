import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();
  
  // Se não houver sessão, redirecionar para autenticação
  if (!session?.user?.id) {
    redirect('/authentication');
  }

  // Se houver sessão, redirecionar para dashboard
  redirect('/dashboard');
}

