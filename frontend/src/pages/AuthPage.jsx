import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        alert('Account created successfully! You can now log in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await supabase.rpc('increment_streak', { user_id: data.user.id });
        navigate('/profile');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-950 flex flex-col justify-center items-center px-4 font-sans text-gray-100">
      <div className="mb-6 flex items-center gap-2">
        <Link to="/" className="text-4xl">🎬</Link>
        <h1 className="text-2xl font-extrabold text-white">
          Code<span className="text-purple-500">Anim</span> Account
        </h1>
      </div>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-center text-white">
          {isSignUp ? 'Create your Account' : 'Welcome Back'}
        </h2>

        <p className="text-xs text-gray-400 text-center mb-6">
          {isSignUp
            ? 'Save custom algorithms & track your learning journey'
            : 'Log in to access your saved codes'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 text-red-300 text-xs rounded-lg font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold rounded-lg text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-purple-400 hover:underline font-semibold ml-1"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;