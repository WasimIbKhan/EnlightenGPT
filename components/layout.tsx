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

const Layout = ({ children }: LayoutProps) => {
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
    <div>
        <div className="py-3">
                <nav className="ml-4 pl-1 flex items-center space-x-8">
                    <div className="inline-flex space-x-8 bg-white px-4 py-2 rounded shadow">
                        <a href="#" className="text-lg font-semibold hover:text-slate-600 cursor-pointer" onClick={() => router.push('/TutorBot')}>
                            TutorBot
                        </a>
                        <a href="#" className="text-lg font-semibold hover:text-slate-600 cursor-pointer" onClick={() => router.push('/DocumentQ_A')}>
                            Document Q/A
                        </a>
                        <a href="#" className="text-lg font-semibold hover:text-slate-600 cursor-pointer" onClick={() => router.push('/SummerisePage')}>
                            Summerise
                        </a>
                        <button onClick={handleLogout} className="text-lg font-semibold hover:text-slate-600 cursor-pointer ml-4">
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        <div>
            <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    </div>
);
}
Layout.displayName = 'Layout';

export default Layout;