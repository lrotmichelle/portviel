'use client';

import React from 'react';

export default function PrivacyPage() {
  const lastUpdated = 'October 20, 2026';

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-400">Last updated: {lastUpdated}</p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
          <p className="text-zinc-300 leading-relaxed">
            PortVille ("we", "us", "our") operates the Platform at portville.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services: Discover (jobs and talent), Campaign (engagement and monetization), Market (account trading), and Office (finance and operations).
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-white">2.1 Account and Profile Data</h3>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Name, email, phone number, and bank account details (for verification and payments)</li>
            <li>Raw personal contact details such as email and phone number are never visible to the public, protecting you from spambots, phishing attacks, and scraping of unmasked phone numbers and emails</li>
            <li>Profile photo, bio, skills, experience, education, and references (CV data)</li>
            <li>Submitting your CV application shares it strictly with employers for recruitment purposes only. Your CV is not displayed publicly on the platform or shared with other third parties. Employers are not permitted to share an employee's CV with any third party</li>
          </ul>

          <h3 className="text-lg font-medium text-white">2.2 Financial Data</h3>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Payment method details: Airtel Money phone, MTN till number, bank account</li>
            <li>Transaction history: deposits, withdrawals, campaign payouts, market sales, publishing fees</li>
            <li>Tax identification (if required for payouts above threshold)</li>
          </ul>

          <h3 className="text-lg font-medium text-white">2.3 KYC and Identity Verification Data</h3>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Government ID: National ID, Passport, or Driving Permit (Tier 2+)</li>
            <li>Selfie with liveness detection (Tier 2+)</li>
            <li>Proof of address: utility bill, bank statement (less than 3 months) (Tier 3)</li>
            <li>Source of funds declaration (Tier 3, high-value transactions)</li>
            <li>Corporate documents: certificate of incorporation, TIN, board resolution (brands and agencies)</li>
            <li>Required to verify account ownership and protect against fraud, ensuring fair transactions where disputes can be resolved fairly. Boosts confidence that job applications are submitted by genuine candidates, protecting against spam applications, and proves that employers are also genuine</li>
          </ul>

          <h3 className="text-lg font-medium text-white">2.4 Activity Data</h3>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Job applications, CV submissions, hiring decisions (Discover)</li>
            <li>Application submissions, timestamps, status updates attached. Communications sent through the platform regarding applications are recorded</li>
            <li>Purpose: to process job applications and connect job seekers with employers or listing owners, to show candidates their application history and current status, and to provide analytics for employers managing incoming applications</li>
            <li>Retention: only rejected CVs are deleted from the job listing manager page; the rest remain active until requested for deletion</li>
          </ul>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Campaign configuration data (start and end dates, budget parameters, target audience, CPM participation, performance metrics, conversion rates) to execute and render campaigns on the platform accurately, to generate reporting and analytics for campaign managers, and to accurately calculate billing, platform, and budget usage tied to campaign performance</li>
          </ul>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Account listings, purchases, transaction records, transfer confirmations (Market) to publish, maintain, and display listings across the platform search and filters</li>
          </ul>
          <ul className="ml-6 space-y-2 text-zinc-300 list-disc">
            <li>Login timestamps, device info, IP address, browser fingerprint (security) to approximate location. This relates directly to security and user account monitoring, assisting users with account recovery and verifying legitimate activity during disputes</li>
            <li>Login dates and exact timestamps, logout times, active session duration, keeping users logged in securely and handling session timeouts</li>
            <li>Security and fraud prevention: detecting unauthorized access, account takeover attempts, suspicious concurrent logins or bots, and stolen accounts</li>
          </ul>

          <h3 className="text-lg font-medium text-white">2.5 Cookies and Local Storage</h3>
          <p className="text-zinc-300 leading-relaxed">
            We use browser localStorage for: session persistence, transaction cache, CV drafts, application drafts, UI preferences. No third-party tracking cookies. You may clear localStorage at any time via browser settings; this will log you out and clear drafts.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Service Delivery</strong> — Match workers with jobs, process campaign payouts, escrow market sales, record transactions</li>
            <li><strong>Account Management</strong> — Authentication, notifications, support, fraud prevention</li>
            <li><strong>Legal Compliance</strong> — Anti-money laundering (AML) per the Anti-Money Laundering Act 2013, know-your-customer (KYC) per Bank of Uganda (BOU) guidelines, tax reporting under the Uganda Revenue Authority (URA), and data protection law under the Data Protection and Privacy Act 2019</li>
            <li><strong>Platform Improvement</strong> — Anonymized analytics on feature usage, performance bottlenecks, user flows</li>
            <li><strong>Safety and Security</strong> — Detect bots, fake engagement, stolen accounts, prohibited content</li>
            <li><strong>Income Security</strong> — Monitor transaction patterns for anomalies, enforce segregation of user funds from operational accounts, maintain 1:1 backing with partner trust accounts</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">4. Data Sharing and Disclosure</h2>
          <p className="text-zinc-300 leading-relaxed">We do not sell your data. We share only as follows:</p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Payment Processors</strong> — Airtel Money, MTN MoMo, partner banks (for transaction execution only)</li>
            <li><strong>Counterparties</strong> — On Discover: your CV to employers you apply to. On Campaign: your performance metrics to the brand. On Market: listing details to buyers; buyer identity to sellers upon purchase</li>
            <li><strong>Legal Authorities</strong> — When required by Ugandan law, court order, or regulatory request (PDPO, FIA, URA, BOU)</li>
            <li><strong>Service Providers</strong> — Hosting, email delivery, fraud detection, KYC verification (bound by DPAs, data processed in Uganda or adequate jurisdictions)</li>
            <li><strong>Business Transfers</strong> — In a merger or acquisition, data transfers with same protections; you will be notified</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">5. Data Security</h2>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li>TLS 1.3 encryption in transit; AES-256 at rest for sensitive fields (KYC docs, payment details, passwords)</li>
            <li>Payment data tokenized; full card and bank details never stored on our servers</li>
            <li>Role-based access control; staff access logged and audited. KYC documents accessible only to compliance team</li>
            <li>Annual penetration testing; vulnerability disclosure program</li>
            <li>Data breach response plan: 72-hour notification to PDPO and affected users</li>
            <li>Immutable audit logs for all financial transactions and KYC verifications (append-only, tamper-evident)</li>
          </ul>
          <p className="text-zinc-300 leading-relaxed">
            While we enforce industry-standard security practices, no transmission method over the internet or electronic storage solution is 100% secure. You are responsible for your account credentials: use strong passwords, passkeys, two-factor authentication, and log out on shared devices.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">6. Income Security and Fund Protection</h2>
          <p className="text-zinc-300 leading-relaxed">
            Your money's safety is our highest priority. PortVille implements multiple layers of financial protection:
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Segregated Accounts</strong> — User funds are held in dedicated trust accounts with licensed financial institutions (Airtel Money, MTN MoMo, partner banks), completely separate from PortVille's operational accounts</li>
            <li><strong>1:1 Backing</strong> — Every UGX in your PortVille balance is backed 1:1 by reserves in partner trust accounts. Verified quarterly by independent auditors</li>
            <li><strong>Insolvency Protection</strong> — In the unlikely event of PortVille insolvency, user funds are ring-fenced and not part of the bankruptcy estate. Returned per Bank of Uganda regulations</li>
            <li><strong>Escrow for Market P2P</strong> — All Market purchases use escrow. Buyer funds locked until ownership transfer verified. Seller paid only after 48-hour stability confirmation</li>
            <li><strong>Campaign Payout Guarantees</strong> — Brand campaign budgets are pre-funded and held in escrow. Influencer payouts triggered automatically on verified performance; no manual approval delays</li>
            <li><strong>Withdrawal Integrity</strong> — Withdrawals require Tier 2+ KYC, 2FA confirmation, and are processed via licensed channels only. No third-party or peer-to-peer withdrawals</li>
            <li><strong>Fraud Monitoring</strong> — Real-time transaction scoring (velocity, geography, device, behavioral). Suspicious transactions auto-blocked for review</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">7. Market P2P Purchase Policy (Privacy Aspects)</h2>
          <p className="text-zinc-300 leading-relaxed">
            The Market's peer-to-peer account trading involves specific data flows:
          </p>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Listing Data</strong> — Public: platform, follower count, engagement rate, niche, price. Private (PortVille only): proof of ownership recordings, seller KYC</li>
            <li><strong>Buyer Disclosure</strong> — Upon purchase: buyer receives seller's verified identity (name, verification tier). Seller receives buyer's verified identity. Contact details shared only post-completion</li>
            <li><strong>Transfer Verification</strong> — PortVille monitors account metrics (follower count, engagement) for 48 hours post-transfer. No credentials stored</li>
            <li><strong>Dispute Data</strong> — Dispute evidence (screenshots, platform notifications) retained for 2 years. Accessible to both parties and mediators</li>
            <li><strong>Anonymized Analytics</strong> — Aggregated Market data (average prices by niche, volume trends) published without identifiable information</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">8. Your Rights (Uganda DPA 2019 and GDPR-aligned)</h2>
          <ul className="ml-6 space-y-3 text-zinc-300 list-disc">
            <li><strong>Access</strong> — Request a copy of all personal data we hold</li>
            <li><strong>Rectification</strong> — Correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong> — Delete non-mandatory data (right to be forgotten)</li>
            <li><strong>Portability</strong> — Receive your data in a structured, machine-readable format</li>
            <li><strong>Restriction</strong> — Limit processing while disputes are resolved</li>
            <li><strong>Objection</strong> — Object to processing for direct marketing or legitimate interest</li>
            <li><strong>Automated Decisions</strong> — Request human review of algorithmic outcomes (e.g., campaign reward calculation, fraud flags)</li>
          </ul>
          <p className="text-zinc-300 leading-relaxed">
            Submit requests to <a href="mailto:support@portville.com" className="text-emerald-300 hover:underline">support@portville.com</a>. We respond within 30 days (extendable to 60 for complexity).
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">9. Children's Privacy</h2>
          <p className="text-zinc-300 leading-relaxed">
            The Platform is not directed to persons under 18. We do not knowingly collect data from minors. If you believe a minor has provided data, contact us for immediate deletion.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">10. International Transfers</h2>
          <p className="text-zinc-300 leading-relaxed">
            Data is primarily processed in Uganda. Any cross-border transfers (e.g., cloud providers) use Standard Contractual Clauses or adequacy decisions. You may request transfer details.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">11. Data Retention</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="pb-2 font-medium text-white">Data Category</th>
                  <th className="pb-2 font-medium text-white">Retention Period</th>
                  <th className="pb-2 font-medium text-white">Basis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800"><td className="py-2">Transaction records</td><td className="py-2">1 year</td><td className="py-2">Financial regulation (BOU, URA)</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">KYC and identity docs</td><td className="py-2">2 years post-account closure</td><td className="py-2">AML Act (Anti-Money Laundering Act 2013)</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">Applications and CVs</td><td className="py-2">Active + 9 months</td><td className="py-2">Legitimate interest, user control</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">Campaign performance</td><td className="py-2">1 year</td><td className="py-2">Contractual, dispute resolution</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">Market logs</td><td className="py-2">2 years</td><td className="py-2">Financial regulation (BOU)</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">Market dispute records</td><td className="py-2">9 months</td><td className="py-2">Dispute resolution</td></tr>
                <tr className="border-b border-zinc-800"><td className="py-2">Access logs and security events</td><td className="py-2">9 months</td><td className="py-2">Security, legal obligation</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            You may request deletion of non-mandatory data at any time. Mandatory records are retained per law and anonymized where possible after the retention period.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">12. Changes to This Policy</h2>
          <p className="text-zinc-300 leading-relaxed">
            Updates will be posted here with a revised "Last updated" date. Material changes trigger email notification and a 30-day notice banner on the Platform.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white">13. Contact</h2>
          <p className="text-zinc-300 leading-relaxed">
            Data Protection Officer: <a href="mailto:support@portville.com" className="text-emerald-300 hover:underline">support@portville.com</a><br />
            Phone: +256 740 795 413<br />
            Address: Kampala, Uganda<br />
            Personal Data Protection Office (PDPO): <a href="https://pdpo.go.ug" target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline">pdpo.go.ug</a>
          </p>
        </section>

        <footer className="pt-8 border-t border-zinc-800 text-zinc-500 text-sm text-center">
          &copy; {new Date().getFullYear()} PortVille. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
