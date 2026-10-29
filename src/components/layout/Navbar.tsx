"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Bell, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/hooks/useNotification"

const navLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/campaign", label: "Campaign" },
    { href: "/market", label: "Market" },
    { href: "/office", label: "Office" },
    { href: "/office/profile", label: "Profile" },
]

export default function Navbar() {
    const { notificationCount, cartCount, markNotificationsAsSeen, markCartAsSeen, isNotificationSeen, isCartSeen } = useNotification()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement | null>(null)

    const formatBadgeCount = (count: number) => (count > 99 ? "99+" : String(count))
    const shouldShowBadge = (count: number, hasBeenSeen: boolean) => count > 0 && !hasBeenSeen

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isMenuOpen])

    const handleCartClick = () => {
        markCartAsSeen()
    }

    const handleNotificationClick = () => {
        markNotificationsAsSeen()
    }

    const closeMenu = () => setIsMenuOpen(false)

    return (
        <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 mx-auto">

<Link href="/" className="flex items-center space-x-2 focus-visible:outline-hidden">
    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-zinc-950 text-lg shadow-lg shadow-emerald-500/20">
        P
    </div>
    <span className="text-xl font-bold tracking-tight text-white">PortVille</span>
</Link>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/discover" className="text-sm font-medium hover:underline">Discover</Link>
                    <Link href="/campaign" className="text-sm font-medium hover:underline">Campaign</Link>
                    <Link href="/market" className="text-sm font-medium hover:underline">Market</Link>
                    <Link href="/office" className="text-sm font-medium hover:underline">Office</Link>
                    <Link href="/office/profile" className="text-sm font-medium hover:underline">Profile</Link>
                </nav>

                <div className="flex items-center space-x-1 sm:space-x-5">

                    {/* Notification Button */}
                    <Link href="/orders" passHref>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 rounded-full focus-visible:ring-2 hover:bg-black/5 dark:hover:bg-white/5 flex flex-col items-center justify-center"
                            aria-label="View Orders"
                            onClick={handleNotificationClick}
                        >
                            <Bell className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                            {shouldShowBadge(notificationCount, isNotificationSeen) && (
                                <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold text-red-600 dark:text-red-500">
                                    {formatBadgeCount(notificationCount)}
                                </span>
                            )}
                            <span className="hidden md:inline ml-2 text-[12px] font-medium">Orders</span>
                            <span className="block md:hidden text-[10px] mt-0.5">Orders</span>
                        </Button>
                    </Link>

                    {/* Cart Button */}
                    <Link href="/offers" passHref>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 rounded-full focus-visible:ring-2 hover:bg-black/5 dark:hover:bg-white/5 flex flex-col items-center justify-center"
                            aria-label="View Offers"
                            onClick={handleCartClick}
                        >
                            <ShoppingCart className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                            {shouldShowBadge(cartCount, isCartSeen) && (
                                <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                                    {formatBadgeCount(cartCount)}
                                </span>
                            )}
                            <span className="hidden md:inline ml-2 text-[12px] font-medium">Offers</span>
                            <span className="block md:hidden text-[10px] mt-0.5">Offers</span>
                        </Button>
                    </Link>

                    <div className="md:hidden" ref={menuRef}>
                        <button
                            type="button"
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full focus-visible:ring-2 hover:bg-black/5 dark:hover:bg-white/5"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-30 bg-black/10" onClick={closeMenu} />
                                <div className="absolute right-0 top-14 z-40 w-48 rounded-2xl bg-zinc-950/95 p-2 shadow-lg ring-1 ring-white/10">
                                    {navLinks.map(({ href, label }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className="block rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-neutral-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                                            onClick={closeMenu}
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}