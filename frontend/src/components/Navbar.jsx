// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, openAuthModal } = useAuth();

  return (
    <nav className="navbar flex items-center justify-between px-6 h-16 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-extrabold">🎬 CodeAnim</Link>
        <div className="flex items-center gap-2">
          <Link to="/algorithms" className="text-sm text-gray-300 hover:text-purple-400">Algorithm Library</Link>
          <Link to="/learn" className="text-sm text-gray-500 hover:text-gray-300 ml-3">Learn Hub (Coming Soon)</Link>
        </div>
      </div>

      <div className="nav-actions">
        {!user ? (
          <div className="auth-btn-group flex gap-2">
            <button 
              className="btn-secondary px-3 py-1 rounded bg-gray-800 text-gray-300"
              onClick={() => openAuthModal('Welcome back! Log in to access your profile.')}
            >
              Log In
            </button>
            <button 
              className="btn-primary px-3 py-1 rounded bg-purple-600 text-white"
              onClick={() => openAuthModal('Create an account to save custom lists and algorithms.')}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="user-profile-badge text-sm text-gray-200">
            <Link to="/profile" className="hover:underline">{user.email}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}