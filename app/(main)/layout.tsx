import { NavBar } from '@/components/NavBar';
import { AuthWatcher } from '@/components/AuthWatcher';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <AuthWatcher />
      {children}
    </>
  );
}
