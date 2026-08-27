import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingNav from '../components/LandingNav';

export default function PatchHistory() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Your release data. The first item is always the "Current" version.
  const releases = [
    {
      version: 'v1.4.0',
      date: 'August 2026',
      title: 'The Tactile Update',
      tag: 'Current Release',
      tagColor: 'bg-(--cobalt-tint) text-(--cobalt) border-(--cobalt)/30',
      description: 'Ditched the dark SaaS look for a warm, physical paper-and-ink aesthetic. Unified the navigation and framed the whole app in a curved hardware window.',
      changes: [
        'Built a global LandingNav component to stop the double-navbar madness.',
        'Migrated the entire app to canonical CSS variables (--canvas, --ink, etc.) for zero Tailwind warnings.',
        'Added custom scrollbar styling: thick 14px bars for the main page, thin 6px bars for the code editor so they stay out of your way.',
        'Added the tactile "Why I Built This" scrapbook section to the landing page.'
      ]
    },
    {
      version: 'v1.3.2',
      date: 'July 2026',
      title: 'Auth & Limits',
      tag: 'Security Update',
      tagColor: 'bg-(--teal-tint) text-(--teal) border-(--teal)/30',
      description: 'Hardened the workspace to prevent abuse and made logging in frictionless.',
      changes: [
        'Wired up GitHub and Google OAuth login via Supabase.',
        'Implemented a brute-force lockout: 5 failed attempts triggers a 30-second cooldown timer.',
        'Added execution tracking to limit unauthenticated guests to 3 traces per day.'
      ]
    },
    {
      version: 'v1.2.0',
      date: 'June 2026',
      title: 'The Visualizer Engine',
      tag: 'Feature Release',
      tagColor: 'bg-(--yellow-tint) text-[#B47C11] border-(--yellow)/50',
      description: 'The core engine upgrade. Swapped out static mockups for real Python AST parsing.',
      changes: [
        'The Visualizer now reads live Python code and maps memory addresses step-by-step.',
        'Added the interactive Algorithm Library database with complexity metrics.',
        'Launched the split-pane Workspace UI with playback speed controls.'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Patch History | CodeToAnim</title>
        <meta name="description" content="Changelog and release notes for the CodeToAnim visualizer." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-(--canvas) text-(--ink) font-sans selection:bg-(--cobalt) selection:text-white overflow-x-hidden">
        
        <LandingNav />

        <main className="max-w-4xl mx-auto w-full px-6 py-16 grow flex flex-col gap-12">
          
          {/* Header */}
          <div className="text-center sm:text-left space-y-4">
            <span className="px-3 py-1 rounded-md bg-(--canvas-tint) text-(--ink-secondary) text-xs font-mono font-bold uppercase tracking-wider border border-(--ink-line)">
              Changelog
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-(--ink)">
              Patch <span className="text-(--cobalt)">History</span>
            </h1>
            <p className="text-lg text-(--ink-secondary) font-medium max-w-2xl">
              A log of the updates, bug fixes, and engine overhauls shipped to CodeToAnim.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-10 relative before:absolute before:inset-0 before:left-[35px] before:w-px before:bg-(--ink-line) before:-z-10">
            {releases.map((release, idx) => (
              <div key={idx} className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                
                {/* Version Badge (Left on Desktop, Top on Mobile) */}
                <div className="w-[70px] shrink-0 bg-(--canvas-paper) border-2 border-(--ink-line-strong) rounded-lg py-2 flex flex-col items-center justify-center font-mono font-bold text-sm text-(--ink) shadow-sm">
                  {release.version}
                </div>

                {/* Release Card */}
                <div className="flex-1 bg-(--canvas-paper) border border-(--ink-line) rounded-xl p-6 sm:p-8 shadow-sm hover:border-(--cobalt) transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-mono font-bold text-(--ink-muted)">
                      {release.date}
                    </span>
                    <span className={`self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border shadow-sm ${release.tagColor}`}>
                      {release.tag}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-(--ink) tracking-tight mb-2">
                    {release.title}
                  </h2>
                  <p className="text-sm text-(--ink-secondary) font-medium leading-relaxed mb-6">
                    {release.description}
                  </p>

                  <ul className="space-y-3 border-t border-(--ink-line) pt-5">
                    {release.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-sm text-(--ink-secondary) flex items-start gap-3">
                        <span className="text-(--cobalt) font-bold mt-0.5">•</span>
                        <span className="leading-relaxed font-medium">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>

        </main>

        {/* Footer */}
        <footer className="w-full border-t border-(--ink-line) bg-(--canvas-paper) py-12 px-6">
          <div className="max-w-7xl mx-auto text-xs text-(--ink-muted) flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} CodeToAnim Studio. Continuously evolving.</p>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-(--cobalt) transition-colors font-medium">About</Link>
              <Link to="/workspace" className="hover:text-(--cobalt) transition-colors font-medium">Workspace</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}