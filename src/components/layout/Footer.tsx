import Link from 'next/link';

const data = {
    facebookLink: 'https://facebook.com/portville',
    instaLink: 'https://instagram.com/portville',
    tiktokLink: 'https://tiktok.com/@portville',
    snapchatLink: 'https://snapchat.com/add/portville',
    services: {
        discover: '/discover',
        campaign: '/campaign',
        market: '/market',
    },
    about: {
        terms: '/terms',
        privacy: '/privacy',
        careers: '/discover',
    },
    contact: {
        email: 'support@portville.com',
        phone: '+256740795413',
        address: 'Kampala, UG',
    },
    company: {
        name: 'PortVille',
        description:
            'Your modern market platform to discover, run campaigns, and trade seamlessly on any device.',
        logo: '/logo.webp',
    },
};

const socialLinks = [
    { label: 'Facebook', href: data.facebookLink },
    { label: 'Instagram', href: data.instaLink },
    { label: 'TikTok', href: data.tiktokLink },
    { label: 'Snapchat', href: data.snapchatLink },
];

const aboutLinks = [
    { text: 'Terms of Service', href: data.about.terms },
    { text: 'Privacy Policy', href: data.about.privacy },
    { text: 'Careers', href: data.about.careers },
];

const serviceLinks = [
    { text: 'Discover', href: data.services.discover },
    { text: 'Campaign', href: data.services.campaign },
    { text: 'Market', href: data.services.market },
];

const contactInfo = [
    { text: data.contact.email },
    { text: data.contact.phone },
    { text: data.contact.address, isAddress: true },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 text-gray-400 text-sm mt-auto w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

                {/* Main responsive row container */}
                <div className="flex flex-col lg:flex-row items-stretch justify-between gap-y-6 lg:gap-y-0 lg:divide-x lg:divide-zinc-800 w-full">

                    {/* Column 1: Brand Info */}
                    <div className="w-full lg:w-1/4 text-center lg:text-left flex flex-col items-center lg:items-start justify-start space-y-2 lg:pr-6 pb-2 lg:pb-0">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            <span className="text-base font-bold text-white tracking-tight">
                                {data.company.name}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-normal max-w-xs text-center lg:text-left">
                            {data.company.description}
                        </p>

                        <ul className="flex justify-center lg:justify-start gap-4 pt-1 text-sm">
                            {socialLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="text-gray-500 hover:text-white transition-colors">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Combined Desktop Grid / Mobile side-by-side split container */}
                    <div className="w-full lg:w-3/4 grid grid-cols-2 lg:grid-cols-3 divide-x divide-zinc-800 lg:px-6 items-start pt-2 lg:pt-0">

                        {/* Column 2: Legal / Info Links */}
                        <div className="text-center w-full space-y-1 pr-2 lg:px-4">
                            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                                Platform
                            </h3>
                            <ul className="space-y-1.5 text-xs flex flex-col items-center">
                                {aboutLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <Link href={href} className="hover:text-white transition-colors">
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Navigation Hub */}
                        <div className="text-center w-full space-y-1 hidden lg:block lg:px-4">
                            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                                Explore
                            </h3>
                            <ul className="space-y-1.5 text-xs flex flex-col items-center">
                                {serviceLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <Link href={href} className="hover:text-white transition-colors">
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact Us Content */}
                        <div className="text-center lg:text-right w-full space-y-1 pl-4 lg:pl-6 flex flex-col items-center lg:items-end">
                            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                                Contact Us
                            </h3>
                            <ul className="space-y-2 text-[11px] flex flex-col items-center lg:items-end w-full">
                                {contactInfo.map(({ text, isAddress }) => (
                                    <li key={text} className="text-gray-400">
                                        {isAddress ? (
                                            <address className="not-italic text-center lg:text-right max-w-[130px] sm:max-w-none">
                                                {text}
                                            </address>
                                        ) : (
                                            <span>{text}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                </div>

                {/* Separator Section line */}
                <div className="mt-6 pt-4 border-t border-zinc-900">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-center text-center text-[11px] text-gray-500 w-full gap-x-6 gap-y-1">
                        <p>&copy; {currentYear} {data.company.name}. All rights reserved.</p>
                        <span className="hidden sm:inline text-zinc-800">|</span>
                        <p>Built with Next.js & Tailwind</p>
                    </div>
                </div>

            </div>
        </footer>
    );
}