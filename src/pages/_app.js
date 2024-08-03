// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {auth} from '../../firebase';
import { app } from '../../firebase'; // Ensure firebase is correctly set up

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && router.pathname !== '/') {
        // Redirect to the landing page (index.js) if not authenticated and not already there
        router.push('/');
      } else if (user && router.pathname === '/') {
        // Redirect to home page if authenticated and on the landing page
        router.push('/page');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return <Component {...pageProps} />;
}

export default MyApp;
