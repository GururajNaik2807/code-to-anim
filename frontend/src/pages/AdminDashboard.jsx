import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ bgPanel, bgMain, metallicBorder, accentBg, accentText, textPrimary, textSecondary, hoverBg }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, is_premium')
        .eq('is_tester', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching tester requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const grantAccess = async (userId) => {
    try {
      const { error } = await supabase.rpc('grant_tester_access', { 
        target_user_id: userId 
      });

      if (error) throw error;
      
      setRequests(requests.map(req => 
        req.id === userId ? { ...req, is_premium: true } : req
      ));
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access. Are you logged in as the admin?");
    }
  };

  if (user?.email !== ADMIN_EMAIL) {
    return <div className={`text-center py-20 font-bold ${textSecondary}`}>Unauthorized access.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
        <div className="text-center sm:text-left space-y-1">
          <h1 className={`text-4xl font-black tracking-tight ${textPrimary}`}>Tester Requests</h1>
          <p className={`text-sm font-medium ${textSecondary}`}>Manage and approve users requesting early access to CodeToAnim.</p>
        </div>
        
        {/* --- REFRESH BUTTON --- */}
        <button
          onClick={() => fetchRequests(true)}
          disabled={refreshing || loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${metallicBorder} ${bgPanel} ${textPrimary} text-xs font-bold shadow-sm transition-all hover:opacity-80 active:scale-95 disabled:opacity-50`}
        >
          <svg 
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} ${accentText}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh List'}</span>
        </button>
      </div>

      {loading ? (
        <div className={`w-full p-12 border ${metallicBorder} ${bgPanel} rounded-3xl shadow-sm flex flex-col justify-center items-center h-48`}>
          <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mb-3 border-[${accentBg}]`}></div>
          <span className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Loading Queue...</span>
        </div>
      ) : (
        <div className={`border ${metallicBorder} ${bgPanel} rounded-3xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className={`border-b ${metallicBorder} ${bgMain}/40`}>
                  <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Developer</th>
                  <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Email</th>
                  <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Status</th>
                  <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${textSecondary} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`py-16 text-center text-sm font-medium ${textSecondary}`}>No pending tester requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className={`border-b ${metallicBorder} transition-colors last:border-0 hover:bg-black/5 dark:hover:bg-white/5`}>
                      <td className={`py-4 px-6 font-bold text-sm ${textPrimary}`}>{req.display_name || 'Anonymous'}</td>
                      <td className={`py-4 px-6 text-sm ${textSecondary}`}>{req.email}</td>
                      <td className="py-4 px-6">
                        {req.is_premium ? (
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-sm">APPROVED</span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm">PENDING</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!req.is_premium && (
                          <button 
                            onClick={() => grantAccess(req.id)}
                            className={`${accentBg} hover:opacity-85 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95`}
                          >
                            Grant Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}