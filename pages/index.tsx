import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Login from './LoginPage'; // Your Login component
import { useSelector } from 'react-redux';
import { RootState } from '@/store/RootState';

export default function Home() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const authenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    useEffect(() => {
        if (authenticated) {
            setIsAuthenticated(true);
        }
    }, [authenticated]); // Added dependency to re-run effect when authenticated changes

    if (isAuthenticated) {
        router.push('/ChatPage'); // Redirect to ChatPage if authenticated
        return null;
    }

    return <Login />; // Render the Login component if not authenticated
}
