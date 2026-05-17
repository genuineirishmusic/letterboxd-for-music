import Link from 'next/link';

export const Header = () => {
  return (
    <header className="border-b border-ink-800/10 bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-ink-900">
          Genuine Clip Finder
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
          <a href="#rules" className="hover:text-ink-900">
            Rules
          </a>
          <a href="#workflow" className="hover:text-ink-900">
            Workflow
          </a>
        </nav>
        <span className="tag">No scraping · No auto-posting</span>
      </div>
    </header>
  );
};
