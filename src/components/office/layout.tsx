// src/app/office/layout.tsx
export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-black">
      {/* FIXED SIDE MENU */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 md:block">
        <nav className="p-4">
          {/* Your menu links here */}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-black">
        {children}
      </main>
    </div>
  );
}