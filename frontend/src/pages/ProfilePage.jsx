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
  const [stats, setStats] = useState({ total_learning_time_minutes: 0, total_executions: 0 });
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
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileErr) console.warn('Profile fetch error', profileErr);
    setProfile(profileData || {});

    // Fetch saved algorithms for this user (saved_algorithms table)
    const { data: codesData, error: codesErr } = await supabase
      .from('saved_algorithms')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (codesErr) console.warn('Saved algorithms fetch error', codesErr);
    setSavedCodes(codesData || []);

    // Fetch aggregated stats if available
    const { data: statsData, error: statsErr } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!statsErr && statsData) {
      setStats(statsData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { state: { openLogin: true } });
  };

  const handleThemeChange = async (themeKey) => {
    try {
      changeTheme(themeKey);
      // Persist preference to profiles table
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ workspace_theme: themeKey })
          .eq('id', user.id);
        if (error) console.warn('Could not persist workspace theme', error);
        setProfile((p) => ({ ...(p || {}), workspace_theme: themeKey }));
      }
    } catch (err) {
      console.error('Theme change failed', err);
    }
  };

  const handleDeleteCode = async (id) => {
    await supabase.from('saved_algorithms').delete().eq('id', id);
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
        
            {/* User Hero & Analytics */}
            <div className={`${theme.card} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl`}>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  👋 {profile?.display_name || user?.email?.split('@')[0]}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-1">{user?.email}</p>
                <div className="mt-3 text-sm text-gray-300 flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-purple-900/30 text-purple-300 font-semibold">🔥 {profile?.streak_count || 0} Day Streak</span>
                  <span className="px-3 py-1 rounded bg-gray-800 text-gray-300 font-medium">Workspace Theme: {themes[profile?.workspace_theme || currentTheme]?.name}</span>
                </div>
              </div>

              <div className="flex gap-4 items-center w-full md:w-auto">
                {/* Analytics Tiles */}
                <div className="bg-gray-950/30 border border-gray-800 rounded-xl px-5 py-3 text-center">
                  <div className="text-xs text-gray-400 uppercase font-mono">Total Learning Time</div>
                  <div className="text-2xl font-extrabold text-white mt-1">{Math.round((stats.total_learning_time_minutes || 0))} min</div>
                </div>

                <div className="bg-gray-950/30 border border-gray-800 rounded-xl px-5 py-3 text-center">
                  <div className="text-xs text-gray-400 uppercase font-mono">Total Executions</div>
                  <div className="text-2xl font-extrabold text-white mt-1">{stats.total_executions || 0}</div>
                </div>

                <div className="bg-purple-950/30 border border-purple-800 rounded-xl px-4 py-2 text-center">
                  <button onClick={handleLogout} className="text-sm font-bold bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-white">Log Out</button>
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

            {/* Tab 1: Saved Algorithms Grid */}
        {activeTab === 'saved' && (
          <section>
            {savedCodes.length === 0 ? (
              <div className={`${theme.card} border rounded-2xl p-12 text-center text-gray-500 text-sm font-mono`}>
                    You haven't saved any algorithms yet. Go to the Workspace and click "Save Code"!
              </div>
            ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCodes.map((item) => (
                  <div
                    key={item.id}
                    className={`${theme.card} border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-purple-500/50 shadow-md`}
                  >
                    <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-bold ${theme.accentText} text-sm`}>{item.title}</h3>
                            <span className="text-[10px] text-gray-400 font-mono">{item.list_name || 'Favorites'}</span>
                          </div>

                          <pre className="bg-gray-950 p-3 rounded-lg text-xs font-mono text-gray-400 line-clamp-4 overflow-hidden border border-gray-800/80">
                            {item.code_content || item.code || ''}
                          </pre>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/80">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteCode(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => navigate('/workspace', { state: { presetCode: item.code_content || item.code } })}
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
                    onClick={() => handleThemeChange(key)}
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