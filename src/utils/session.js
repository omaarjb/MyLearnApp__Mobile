import { useAuth, useSignIn } from '@clerk/clerk-expo';

export const clearSession = async (signOut) => {
    try {
      await signOut();
      return true;
    } catch (err) {
      console.error('Sign out error:', err);
      return false;
    }
  };
  
  export const checkExistingSession = async (signIn, setActive, navigation) => {
    try {
      const session = await signIn.attemptFirstFactor();
      if (session?.status === 'complete') {
        await setActive({ session });
        navigation.navigate('Home');
        return true;
      }
    } catch (err) {
      return false;
    }
  };