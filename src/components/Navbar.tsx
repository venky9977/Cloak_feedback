'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from './ui/button';

import '@/styles/globals.css'; // Ensure global styles are imported

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav id="navbar" className='p-4 md:p-6 shadow-md'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        <Link id="navbar-logo" className='text-2xl font-bold mb-4 md:mb-0 text-blue-600' href='/'>
          Cloak Feedback
        </Link>
        <div className="flex items-center">
          {session ? (
            <>
              <span className='mr-4 text-gray-700'>Welcome, {user?.username || user?.email}</span>
              <Button
                id="logout-button"
                className='w-full md:w-auto'
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href='/sign-in'>
              <Button id="login-button" className='w-full md:w-auto'>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
