// src/components/FeedbackWidget.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const MAX_FEEDBACK_LENGTH = 2000;

export default function FeedbackWidget({ user, isDark, metallicBorder, textSecondary, bgPanel }) {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const normalizedMessage = feedbackText.trim().slice(0, MAX_FEEDBACK_LENGTH);
    if (!normalizedMessage || !user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert([
        { user_id: user.id, message: normalizedMessage }
      ]);
      
      if (error) throw error;
      
      setSuccess(true);
      setFeedbackText('');
      setTimeout(() => setSuccess(false), 4000); // Reset button after 4 seconds
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${bgPanel}/90 backdrop-blur-md ${metallicBorder} p-6 rounded-3xl shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Send Feedback</h3>
        <span className="text-xl">🚀</span>
      </div>
      
      <p className={`text-xs font-medium ${textSecondary} mb-4 leading-relaxed`}>
        CodeToAnim is currently in active development. If you experience any errors, glitches, or inconvenience, we are highly open to your suggestions! Your feedback goes directly to the dev team.
      </p>
      
      <textarea
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        maxLength={MAX_FEEDBACK_LENGTH}
        placeholder="Share your thoughts, report a bug, or suggest a feature..."
        className={`w-full h-24 p-3 rounded-xl text-xs font-medium resize-none ${metallicBorder} shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
          isDark 
            ? 'bg-slate-900/50 text-slate-200 placeholder-slate-600' 
            : 'bg-slate-50 text-slate-800 placeholder-slate-400'
        }`}
      ></textarea>
      
      <button
        onClick={handleSubmit}
        disabled={!feedbackText.trim() || isSubmitting || success}
        className={`w-full mt-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex justify-center items-center ${
          success
            ? 'bg-emerald-500 text-white shadow-emerald-900/20'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Sending...' : success ? '✅ Suggestion Sent!' : 'Submit Suggestion'}
      </button>
    </div>
  );
}