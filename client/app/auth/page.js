'use client';
import React, { useState } from 'react';
import { auth, googleProvider } from '@/components/firebase/firebaseconfig';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthFlow = () => {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState('email');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, authData.email, authData.password);
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setError('Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await handlePostLogin(user);
    } catch (error) {
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = async (user) => {
    const response = await axios.get(`http://localhost:3001/api/auth/user/${user.email}`);
    if (response.data.exists) {
        localStorage.setItem('userID', response.data.userId);
      router.push('/'); // Navigate to the home page if the user exists
    } else {
      // Construct the URL with query parameters
      const queryParams = new URLSearchParams({
        email: user.email,
        displayName: user.displayName || '',
      }).toString();

      // Push the user to the profile page with query parameters
      router.push(`/profile?${queryParams}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {authMethod === 'email' && (
          <form onSubmit={isLoginMode ? handleEmailLogin : handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
            >
              {loading ? (isLoginMode ? 'Logging in...' : 'Signing up...') : (isLoginMode ? 'Log In' : 'Sign Up')}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 focus:outline-none disabled:bg-gray-400"
          >
            {loading ? 'Signing in with Google...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-500 ml-1 hover:underline"
          >
            {isLoginMode ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
