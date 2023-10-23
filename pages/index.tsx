import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Login from './LoginPage'; // Your Login component
import { useSelector } from 'react-redux';
import { RootState } from '@/store/RootState';
import {checkAuthState} from '@/store/actions/auth'
import { AppDispatch } from '@/pages/_app';
import { useDispatch } from 'react-redux';
export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const authenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    useEffect(() => {
        dispatch(checkAuthState());
      }, [dispatch]);

    if (authenticated) {
        router.push('/TutorBot'); // Redirect to ChatPage if authenticated
        return null;
    }

    return <Login />; // Render the Login component if not authenticated
}
