import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center text-center p-6 text-white font-sans">
      <h1 className="text-6xl font-extrabold text-purple-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The visualization or page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;