'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OfficeSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Overview', href: '/office' },
    { label: 'Campaign', href: '/office/campaign' },
    { label: 'Discover', href: '/office/discover' },
    { label: 'Market', href: '/office/market' },
  ];

  return (
    <aside className="hidden h-screen w-48 shrink-0 flex-col justify-between border-r border-neutral-800 bg-black sticky top-0 md:flex">
      {/* Main Nav */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg border px-4 py-2 transition-colors ${
                isActive
                  ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                  : 'border-transparent text-zinc-300 hover:border-emerald-500/25 hover:bg-neutral-900 hover:text-emerald-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* CV Section at the Bottom */}
      <div className="p-4 border-t border-neutral-800">
        <Link 
          href="/office/cv"
          className="group block rounded-xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-black transition-all hover:border-emerald-500/40"
        >
          {/* Changed text color to green */}
          <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-2">Make a new CV</p>
          
          <div className="space-y-1.5 text-[10px] text-neutral-300">
            <p className="flex items-center gap-1"><span>☑</span> Change Career</p>
            <p className="flex items-center gap-1"><span>☑</span> Side Hustles</p>
            <p className="flex items-center gap-1"><span>☑</span> Professions</p>
          </div>

          {/* New "UPDATE NOW" Button styling */}
          <div className="mt-4 flex justify-center">
            <span className="px-3 py-1 text-[10px] font-bold border border-neutral-600 rounded-full text-neutral-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
              UPDATE NOW
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}