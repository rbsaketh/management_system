import { Button } from '@mui/material';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignInButton() {
  const handleSignIn = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in: ", result.user);
      })
      .catch((error) => {
        console.error("Error signing in: ", error);
      });
  };

  return (
    <Button variant="contained" color="primary" onClick={handleSignIn}>
      Sign In with Google
    </Button>
  );
}
