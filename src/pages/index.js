// pages/index.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button } from '@mui/material';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push('/page'); // Redirect to the home page if logged in
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        router.push('/page'); // Redirect to the home page
      })
      .catch((error) => {
        console.error('Error signing in: ', error);
      });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={2}
    >
      <Typography variant="h3" gutterBottom>Welcome to Pantry Tracker</Typography>
      <Typography variant="h6" gutterBottom>Login with your Google account to manage your inventory</Typography>
      <Button variant="contained" color="primary" onClick={handleSignIn}>
        Sign In with Google
      </Button>
    </Box>
  );
}
