import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken();

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieFlags = isProduction 
    ? 'secure; sameSite=strict' 
    : 'sameSite=lax';
  
  document.cookie = `authToken=${token}; path=/; max-age=3600; ${cookieFlags}`;

  return userCredential.user;
};

export const logout = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieFlags = isProduction 
    ? 'secure; sameSite=strict' 
    : 'sameSite=lax';
  
  document.cookie = `authToken=; path=/; max-age=0; ${cookieFlags}`;
  await signOut(auth);
};
