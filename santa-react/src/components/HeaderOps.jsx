import React from 'react';

export default function HeaderOps() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">ac_unit</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">North Pole Ops</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
          <a className="text-sm font-medium hover:text-primary transition-colors text-primary" href="#">Wishing Machine</a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Naughty List</a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Nice List</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined mr-2 text-sm">person</span>
            Elf Login
          </button>
        </div>
      </div>
    </header>
  );
}
