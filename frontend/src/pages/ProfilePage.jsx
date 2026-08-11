import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    setUser(session.user);

    // Fetch profile details
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    setProfile(profileData);

    // Fetch saved codes
    const { data: codesData } = await supabase
      .from('saved_codes')
      .select('*')
      .order('created_at', { ascending: false });

    setSavedCodes(codesData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleLoadCode = (code) => {
    navigate('/workspace', { state: { presetCode: code } });
  };

  const handleDeleteCode = async (id) => {
    await supabase.from('saved_codes').delete().eq('id', id);
    setSavedCodes(savedCodes.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-950 text-gray-400 flex items-center justify-center font-mono">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-gray-900 px-8 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2">
          🎬 Code<span className="text-purple-500">Anim</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/workspace" className="text-sm text-purple-400 hover:underline">
            ⚡ Go to Workspace
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-md border border-gray-700"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-8 flex-1 flex flex-col gap-8">
        {/* User Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white">
              👋 {profile?.display_name || user?.email}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{user?.email}</p>
          </div>
          <div className="bg-purple-950/50 border border-purple-800/60 px-4 py-3 rounded-xl text-center">
            <span className="block text-2xl font-black text-purple-400">
              {savedCodes.length}
            </span>
            <span className="text-[10px] font-mono text-gray-400 uppercase">
              Saved Algorithms
            </span>
          </div>
        </div>

        {/* Saved Codes Grid */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📂 Your Saved Algorithm Snippets
          </h2>

          {savedCodes.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm font-mono">
              You haven't saved any code snippets yet. Go to the Workspace and click "Save Code"!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedCodes.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col justify-between transition-all"
                >
                  <div>
                    <h3 className="font-bold text-purple-300 text-sm mb-2">{item.title}</h3>
                    <pre className="bg-gray-950 p-2.5 rounded-lg text-xs font-mono text-gray-400 line-clamp-3 overflow-hidden">
                      {item.code}
                    </pre>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCode(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleLoadCode(item.code)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-md shadow"
                      >
                        Load in Visualizer 🚀
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}