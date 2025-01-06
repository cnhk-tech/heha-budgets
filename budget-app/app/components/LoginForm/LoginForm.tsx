'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  }

  useEffect(() => {
      localStorage.setItem('username', username);
  }, [username]);

    return (
      <div className="w-full max-w-sm p-6 bg-foreground rounded-lg shadow-md">
        <p className="text-lg font-semibold text-center text-background md:text-2xl">One step more to get into our App!</p>
        <div className="py-4">
          <label htmlFor="username" className="block text-md font-medium text-background mb-2">
              User name
          </label>
          <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your user name"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={!username}
          className={`w-full py-2 px-4 font-semibold rounded-md focus:outline-none ${
              username ? "bg-green-800 text-background hover:bg-green-700" : "bg-gray-300 text-foreground cursor-not-allowed"
          }`}
        >
          Login
        </button>
      </div>
    );
};

export default LoginForm;