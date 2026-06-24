import { redirect } from 'next/navigation';

/** Legado: portal do cliente migrou para /cliente */
export default function DashboardRedirect() {
  redirect('/cliente');
}
