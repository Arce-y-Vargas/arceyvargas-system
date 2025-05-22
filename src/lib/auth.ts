import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken();

  document.cookie = `authToken=${token}; path=/; max-age=3600`;

  return userCredential.user;
};

export const logout = async () => {
  document.cookie = "authToken=; path=/; max-age=0";
  await signOut(auth);
};
