'use client';

import React from 'react';

export default function TermsPage() {
  const lastUpdated = 'September 28, 2026';

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-zinc-400">Last updated: {lastUpdated}</p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            By accessing or using PortVille (the "Platform", "Service", or "Site"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not use the Platform.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">2. Platform Overview</h2>
          <p className="text-zinc-300 leading-relaxed">
            PortVille is a social media command center comprising three core modules:
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
<li><strong>Discover</strong> - A marketplace for job opportunities and talent. Employers post vacancies; workers create professional CVs (generated or uploaded) and apply. All applications and resumes are stored in the Office to Discover section.</li>
<li><strong>Campaign</strong> - An engagement and monetization engine. Brands create hashtag campaigns, hire influencers, and drive traffic. Participants earn rewards based on verified performance (views, engagement). Campaign management occurs in Office to Finance.</li>
<li><strong>Market</strong> - A peer-to-peer (P2P) marketplace for social media accounts (3k+ followers). Sellers list accounts at fair prices; buyers browse and purchase. All P2P transactions are escrow-protected and recorded in Office to Finance.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">3. Office & Financial Operations</h2>
          <p className="text-zinc-300 leading-relaxed">
            The <strong>Office</strong> is the central orchestrator for all financial and operational data:
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Finance</strong> - All income (campaign payouts, campaign income from withdrawals, market sales, deposits) and outflows (withdrawals, campaign publishing fees) are recorded here. Supported payment methods: Airtel Money (phone), MTN Mobile Money (till), Bank (account). All transactions persist via localStorage and are user-specific.</li>
            <li><strong>Legal Payment Channels</strong> - Only licensed mobile money operators (Airtel Money, MTN MoMo) and regulated banking institutions in Uganda are permitted. Cryptocurrency, unlicensed payment processors, and informal value transfer systems are strictly prohibited.</li>
            <li><strong>Deposits & Withdrawals</strong> - Users may deposit funds via approved methods. Withdrawals require verified identity (KYC) and are processed within 1–3 business days. Minimum withdrawal: UGX 10,000.</li>
            <li><strong>Campaign Payouts</strong> - Influencer rewards are calculated on verified view counts. No funds shall be embezzled; distribution follows the published CPM/performance formula.</li>
            <li><strong>Market Escrow</strong> - Account sales are held in escrow until ownership transfer is verified. Both parties must confirm completion before release.</li>
            <li><strong>Income Security</strong> - All funds held on the Platform are segregated from operational accounts. User balances are backed 1:1 with partner bank and mobile money operator trust accounts. In the unlikely event of Platform insolvency, user funds are ring-fenced and returned per BOU regulations.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">4. Know Your Customer (KYC) & Verification</h2>
          <p className="text-zinc-300 leading-relaxed">
            KYC is mandatory for all financial activities on PortVille. We comply with Uganda's Anti-Money Laundering Act, 2013, and Bank of Uganda (BOU) guidelines.
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Tier 1 (Basic)</strong> - Email + phone verification. Allows: browsing, applying on Discover, creating campaigns, listing on Market. Limits: deposit up to UGX 500,000; no withdrawals.</li>
            <li><strong>Tier 2 (Verified)</strong> - Tier 1 + government ID (National ID, Passport, or Driving Permit) + selfie liveness check. Allows: all Tier 1 + withdrawals, campaign payouts, Market purchases/sales. Limits: deposit up to UGX 10,000,000; withdrawal up to UGX 5,000,000 daily.</li>
            <li><strong>Tier 3 (Enhanced)</strong> - Tier 2 + proof of address (utility bill, bank statement less than 3 months) + source of funds declaration. Required for: high-value Market transactions (greater than UGX 20,000,000), brand campaign budgets (greater than UGX 50,000,000), or regulatory request.</li>
            <li><strong>Ongoing Monitoring</strong> - Transaction patterns are monitored for structuring, velocity, and sanctions screening. Suspicious activity triggers enhanced due diligence and/or reporting to the Financial Intelligence Authority (FIA).</li>
            <li><strong>Corporate Accounts</strong> - Brands and agencies must provide: certificate of incorporation, TIN, authorized signatory ID, board resolution. Verified within 2 business days.</li>
            <li><strong>Data Handling</strong> - KYC documents are encrypted at rest (AES-256), access-logged, and retained 7 years post-account closure per AML Act. Never shared except with regulators or payment processors for transaction execution.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">5. Market P2P Purchase Policy</h2>
          <p className="text-zinc-300 leading-relaxed">
            The Market facilitates peer-to-peer account transfers. This policy governs all purchases and sales.
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Eligibility</strong> - Only Tier 2+ verified users may buy or sell. Accounts must have 3,000+ genuine followers, no policy violations in the past 12 months, and clear ownership.</li>
            <li><strong>Listing Requirements</strong> - Sellers must provide: platform (TikTok, Instagram, Facebook, Snapchat, YouTube), follower count, engagement rate (last 30 days), niche, asking price (UGX), and proof of ownership (screen recording of account settings).</li>
            <li><strong>Escrow Process</strong> - Buyer funds are locked in escrow upon purchase initiation. Seller has 24 hours to initiate transfer. PortVille verifies ownership change (password/email/phone update, follower count stability for 48 hours). Funds released to seller only after buyer confirms receipt and 48-hour stability period.</li>
            <li><strong>Dispute Window</strong> - Buyer has 72 hours post-transfer to raise disputes: follower drop greater than 15%, account locked/banned, misrepresented metrics. PortVille mediates; decision final and binding.</li>
            <li><strong>Fees</strong> - Platform fee: 5% of sale price (min UGX 5,000, max UGX 500,000), split 50/50 buyer/seller. Fee deducted from escrow before release.</li>
            <li><strong>Prohibited</strong> - Stolen/hacked accounts, bot-inflated followers, accounts with strikes/violations, government/official accounts, accounts tied to illegal activities. Violations: permanent ban, funds forfeited, reported to authorities.</li>
            <li><strong>Refunds</strong> - Only via dispute resolution. No buyer's remorse refunds. Chargebacks are prohibited; initiating a chargeback results in permanent ban and debt collection.</li>
            <li><strong>Ownership Transfer</strong> - Seller must transfer all credentials (email, phone, 2FA, recovery codes). PortVille does not store credentials post-transfer. Buyer responsible for securing account immediately.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">6. Data Protection & Crimes</h2>
          <p className="text-zinc-300 leading-relaxed">
            PortVille takes data protection seriously. We comply with Uganda's Data Protection and Privacy Act, 2019, and applicable international standards.
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Personal Data</strong> - We collect only data necessary for service delivery: name, email, phone, payment details, CV content, application history, transaction records, KYC documents.</li>
            <li><strong>Data Crimes Prohibited</strong> - Unauthorized access, scraping, harvesting, selling, or leaking of user data is a criminal offense. Violators will be reported to the Personal Data Protection Office (PDPO) and prosecuted under Ugandan law.</li>
            <li><strong>No Third-Party Sales</strong> - Your data is never sold to advertisers, data brokers, or third parties. Anonymized analytics may be used for platform improvement.</li>
            <li><strong>Retention</strong> - Transaction records: 7 years (financial regulation). Application/CV data: retained while account is active, deletable on request. KYC documents: 7 years post-closure. Logs: 12 months.</li>
            <li><strong>Your Rights</strong> - Access, rectification, erasure, portability, and objection. Contact <code className="text-emerald-300">support@portville.com</code>.</li>
            <li><strong>Breach Notification</strong> - In the event of a data breach, affected users and the PDPO will be notified within 72 hours as required by law.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">7. User Conduct & Prohibited Activities</h2>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li>No fraud, impersonation, or misrepresentation of identity, followers, or engagement metrics.</li>
            <li>No bots, click farms, or artificial inflation of views/engagement on Campaign.</li>
            <li>No sale of stolen, hacked, or policy-violating accounts on Market.</li>
            <li>No posting of illegal content, hate speech, or prohibited goods/services on Discover.</li>
            <li>No reverse engineering, scraping, or automated access without written permission.</li>
            <li>No money laundering, terrorist financing, or sanctions evasion via Finance.</li>
            <li>No KYC document forgery, identity theft, or use of another person's verified identity.</li>
            <li>No collusion between buyers/sellers to manipulate Market prices or circumvent fees.</li>
          </ul>
          <p className="text-zinc-300 leading-relaxed">
            Violations result in immediate account suspension, forfeiture of funds, and referral to law enforcement.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">8. Intellectual Property</h2>
          <p className="text-zinc-300 leading-relaxed">
            All Platform content (code, design, trademarks "PortVille", logos) is owned by PortVille or licensed. User-generated content (CVs, campaigns, listings) remains yours; you grant PortVille a non-exclusive license to display and distribute it on the Platform.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">9. Disclaimers & Limitation of Liability</h2>
          <p className="text-zinc-300 leading-relaxed">
            The Platform is provided "as is" without warranties. PortVille is not liable for: (a) third-party actions on Market/Discover/Campaign; (b) financial losses from market volatility or campaign performance; (c) data loss beyond our control; (d) indirect, incidental, or consequential damages. Maximum liability: the amount you paid to PortVille in the preceding 12 months.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">10. Governing Law & Dispute Resolution</h2>
          <p className="text-zinc-300 leading-relaxed">
            These Terms are governed by the laws of the Republic of Uganda. Disputes shall be resolved through good-faith negotiation, then binding arbitration in Kampala under the Arbitration and Conciliation Act, Cap. 4. Courts of Uganda have exclusive jurisdiction for injunctive relief.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">11. Changes to Terms</h2>
          <p className="text-zinc-300 leading-relaxed">
            We may update these Terms at any time. Material changes will be notified via email and a prominent banner on the Platform 30 days before taking effect. Continued use constitutes acceptance.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">12. Contact</h2>
          <p className="text-zinc-300 leading-relaxed">
            Questions about these Terms? Contact us at:
          </p>
          <ul className="ml-6 space-y-1 text-zinc-300 list-disc">
            <li>Email: <a href="mailto:support@portville.com" className="text-emerald-300 hover:underline">support@portville.com</a></li>
            <li>Phone: +256 740 795 413</li>
            <li>Address: Kampala, Uganda</li>
          </ul>
        </section>

        <footer className="pt-8 border-t border-zinc-800 text-zinc-500 text-sm text-center">
          &copy; {new Date().getFullYear()} PortVille. All rights reserved.
        </footer>
      </div>
    </main>
  );
}