import type { FC } from 'hono/jsx';

export const AppShell: FC = () => {
  return (
    <div class="flex h-screen w-full flex-col overflow-hidden bg-slate-950">
      {/* Top Header / Status Bar */}
      <header class="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/20">
            02
          </div>
          <span class="text-sm font-medium tracking-tight text-slate-300">Project Workspace</span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-slate-400 border border-slate-700/50">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sync Active
          </div>
          <button class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-500/20">
            Export Code
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main class="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Chat & History */}
        <aside class="flex w-96 flex-col border-r border-slate-800 bg-slate-900/30">
          <div class="flex flex-1 flex-col p-4">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500">History</h2>
              <button class="text-xs text-indigo-400 hover:text-indigo-300">Clear</button>
            </div>
            
            {/* History Feed Placeholder */}
            <div class="flex flex-1 flex-col gap-3 overflow-y-auto pr-2">
              <div class="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
                <div class="mb-1 text-[10px] text-slate-500">Initial State</div>
                <div class="text-xs text-slate-300">Hero Section Scaffolding</div>
              </div>
              <div class="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
                <div class="mb-1 text-[10px] text-indigo-400 font-medium">Applied Nudge</div>
                <div class="text-xs text-slate-300">"Make it calmer" - adjusted padding and text-slate-400</div>
              </div>
            </div>
          </div>
          
          {/* Chat Input Area (Mini Version of OmniBox) */}
          <div class="border-t border-slate-800 bg-slate-900/50 p-4">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Type a nudge... (Cmd+K)" 
                class="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <div class="absolute right-3 top-3 flex gap-1">
                <kbd class="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-sans">⌘</kbd>
                <kbd class="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-sans">K</kbd>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Preview Canvas */}
        <section class="relative flex-1 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] bg-repeat">
          {/* Viewport Controls */}
          <div class="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 p-1 shadow-2xl backdrop-blur-xl">
            <button class="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-medium text-white transition-all">Desktop</button>
            <button class="rounded-full px-4 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/50 transition-all">Tablet</button>
            <button class="rounded-full px-4 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/50 transition-all">Mobile</button>
          </div>

          {/* Device Frame */}
          <div class="flex h-full w-full items-center justify-center p-12 pt-20">
            <div class="h-full w-full max-w-5xl overflow-hidden rounded-xl border border-slate-800 bg-white shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] transition-all">
              <iframe 
                id="preview-sandbox"
                src="about:blank"
                class="h-full w-full border-none"
                title="Preview Sandbox"
              />
            </div>
          </div>
          
          {/* Floating OmniBox Target - Portal logic will render here */}
          <div id="omnibox-portal"></div>
        </section>

        {/* Right Sidebar: Vibe & Tokens (Collapsible) */}
        <aside class="flex w-72 flex-col border-l border-slate-800 bg-slate-900/30">
          <div class="p-4">
            <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Active Vibe</h2>
            <div class="rounded-lg border border-indigo-500/50 bg-indigo-500/10 p-4">
              <div class="mb-2 text-sm font-semibold text-indigo-300">Minimalist</div>
              <p class="text-[11px] leading-relaxed text-slate-400">High-contrast, airy spacing, and geometric typography.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
