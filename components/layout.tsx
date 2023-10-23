// ... other imports
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/actions/auth'; // Replace with the actual path and action name
import { AppDispatch } from '@/pages/_app';
import { RootState } from '@/store/RootState';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()

  const handleLogout = (): void => {
    dispatch(logout()); // Dispatch your logout action
    // You can also add any other logic here, like redirecting the user
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/'); // Redirect to login page
    }
  }, [isAuthenticated]);

  
  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="container sticky top-0 z-40 bg-white">
        <div className="h-16 border-b border-b-slate-200 py-4">
          <nav className="ml-4 pl-6">
            <a href="#" className="hover:text-slate-600 cursor-pointer" onClick={() => router.push('/TutorBot')}>
              TutorBot
            </a>
            <a href="#" className="ml-4" onClick={() => router.push('/DocumentQ_A')}>
              Document Q/A
            </a>
            <a href="#" className="ml-4" onClick={() => router.push('/SummerisePage')}>
              Summerise
            </a>
            <button onClick={handleLogout} className="ml-4">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
