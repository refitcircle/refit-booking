'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Re:Fit" className="w-10 h-10 rounded-full" />
          <span className="font-title font-semibold text-navy tracking-widest text-sm" style={{ letterSpacing: '0.15em' }}>
            RE:FIT
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/contact" className="btn-primary text-xs">
            Me contacter
          </a>
          <a href="/coach" className="text-xs text-gray-300 hover:text-navy transition-colors duration-200">
            coach
          </a>
        </div>
      </div>
    </header>
  );
}
