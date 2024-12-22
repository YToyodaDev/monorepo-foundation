'use client';
import { signOut } from 'next-auth/react';

export const Signout = () => {
  return <button onClick={() => signOut()}>Signout</button>;
};
