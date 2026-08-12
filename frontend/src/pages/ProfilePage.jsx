import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'settings'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentTheme, theme, changeTheme, themes } = useTheme();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    setUser(session.user);

    // Fetch user profile
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

  const handleDeleteCode = async (id) => {
    await supabase.from('saved_codes').delete().eq('id', id);
    setSavedCodes(savedCodes.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className={`h-screen w-screen ${theme.bg} text-gray-400 flex items-center justify-center font-mono`}>
        Loading profile & theme preferences...
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen ${theme.bg} text-gray-100 font-sans flex flex-col`}>
      {/* Header Navigation */}
      <header className="h-16 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur px-8 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-white flex items-center gap-2">
          🎬 Code<span className={theme.accentText}>Anim</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/workspace" className={`text-xs font-bold ${theme.accentText} hover:underline`}>
            ⚡ Workspace
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-md border border-gray-700"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Profile Hub */}
      <main className="max-w-5xl mx-auto w-full p-8 flex-1 flex flex-col gap-8">
        
        {/* User Stats Card */}
        <div className={`${theme.card} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl`}>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              👋 {profile?.display_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{user?.email}</p>
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto">
            {/* Daily Streak Counter */}
            <div className="flex-1 md:flex-none bg-orange-950/40 border border-orange-500/30 px-4 py-3 rounded-xl text-center">
              <span className="block text-2xl font-black text-orange-400">
                🔥 {profile?.streak_count || 1}
              </span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">
                Day Streak
              </span>
            </div>

            {/* Saved Codes Counter */}
            <div className="flex-1 md:flex-none bg-purple-950/40 border border-purple-500/30 px-4 py-3 rounded-xl text-center">
              <span className="block text-2xl font-black text-purple-400">
                {savedCodes.length}
              </span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">
                Saved Codes
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-800 gap-8">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'saved'
                ? `border-purple-500 text-white`
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            📂 Saved Algorithms ({savedCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'settings'
                ? `border-purple-500 text-white`
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            ⚙️ App Settings & Themes
          </button>
        </div>

        {/* Tab 1: Saved Code Library */}
        {activeTab === 'saved' && (
          <section>
            {savedCodes.length === 0 ? (
              <div className={`${theme.card} border rounded-2xl p-12 text-center text-gray-500 text-sm font-mono`}>
                You haven't saved any code snippets yet. Go to the Workspace and click "Save Code"!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCodes.map((item) => (
                  <div
                    key={item.id}
                    className={`${theme.card} border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-purple-500/50 shadow-md`}
                  >
                    <div>
                      <h3 className={`font-bold ${theme.accentText} text-sm mb-2`}>{item.title}</h3>
                      <pre className="bg-gray-950 p-3 rounded-lg text-xs font-mono text-gray-400 line-clamp-4 overflow-hidden border border-gray-800/80">
                        {item.code}
                      </pre>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/80">
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
                          onClick={() => navigate('/workspace', { state: { presetCode: item.code } })}
                          className={`px-3 py-1.5 ${theme.primary} text-xs font-bold rounded-md shadow`}
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
        )}

        {/* Tab 2: Settings & Theme Picker */}
        {activeTab === 'settings' && (
          <section className={`${theme.card} border rounded-2xl p-6 flex flex-col gap-6 shadow-xl`}>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">🎨 Appearance & Themes</h2>
              <p className="text-xs text-gray-400">Choose a theme to customize your workspace and editor aesthetics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(themes).map((key) => {
                const t = themes[key];
                const isSelected = currentTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => changeTheme(key)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/20 bg-gray-900'
                        : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm text-white block mb-1">{t.name}</span>
                      <div className="flex gap-1.5 mt-2">
                        <div className="w-4 h-4 rounded-full bg-gray-950 border border-gray-700"></div>
                        <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                        <div className="w-4 h-4 rounded-full bg-gray-900"></div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-purple-400 font-bold mt-4">
                        ✓ Active Theme
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}