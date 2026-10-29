'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProfileHeader } from './ProfileHeader';
import { AccountSummary } from './AccountSummary';
import { JoinedCampaigns } from './JoinedCampaigns';
import { CreatedCampaigns } from './CreatedCampaigns';
import { DiscoverJobs, type DiscoverJob } from './DiscoverJobs';
import { EditProfileModal } from './EditProfileModal';
import { getMockPublicProfile } from '@/lib/mockProfiles';
import { getMockCampaignMembershipOverrides, getMockProfileCampaignFixtures, normalizeMockCampaignIdentity, setMockCampaignMembership, type MockCampaignFixture } from '@/lib/mockCampaigns';
import { hasSavedCvData, recordOfficeEvent } from '@/lib/office-history';

type CampaignProfile = {
  id: string;
  name: string;
  ownerName: string;
  ownerUsername?: string;
  ownerAccountId?: string;
  employerAccountId: string;
  budgetUgx: number;
  remainingUgx: number;
  budgetUsed: number;
  totalBudget: number;
  budgetPercentAvailable: number;
  viewsGenerated: number;
  cpm: number;
  amount: number;
  membersCount: number;
  status: 'active' | 'paused' | 'ended' | string;
  statusLabel: string;
  stars: number;
  isStarred: boolean;
  viewerIsOwner: boolean;
  canJoin: boolean;
  canLeave: boolean;
  members: { userId: string; name: string; rank: number | string; views?: number; amount: number }[];
  viewerLeader?: { userId: string; name: string; rank: number | string; views?: number; amount: number } | null;
  profileOwner: { name: string; rank: string; isMember: boolean };
  viewer: { name: string; rank: string; isMember: boolean };
};

interface UserData {
  id: string;
  name: string;
  legalName: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  totalReviews: number;
  joinedDate: string;
  kycStatus: 'verified' | 'unverified' | 'pending';
  salesUgx: number;
  investedUgx: number;
}

const formatCurrency = (amountUgx: number, currency = 'UGX') => {
  if (currency === 'USD') return `$${(amountUgx / 3750).toFixed(2)}`;
  if (amountUgx >= 1_000_000) return `UGX ${(amountUgx / 1_000_000).toFixed(2)}M`;
  if (amountUgx >= 1_000) return `UGX ${(amountUgx / 1_000).toFixed(0)}k`;
  return `UGX ${amountUgx.toLocaleString()}`;
};

export default function ProfilePage({ profileAccountId }: { profileAccountId?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'created' | 'joined' | 'jobs'>('created');
  const [focusedTab, setFocusedTab] = useState<'created' | 'joined' | 'jobs' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignError, setCampaignError] = useState('');
  const [createdCampaigns, setCreatedCampaigns] = useState<CampaignProfile[]>([]);
  const [joinedCampaigns, setJoinedCampaigns] = useState<CampaignProfile[]>([]);
  const [createdJobs, setCreatedJobs] = useState<DiscoverJob[]>([]);
  const [mockMembershipOverrides, setMockMembershipOverrides] = useState<Record<string, boolean>>({});
  const [userData, setUserData] = useState<UserData>({
    id: 'usr_9481a82f',
    name: 'Mukisa Calcus',
    legalName: 'Mukisa Calcus John',
    username: 'mukisacalcus',
    avatarUrl: null,
    rating: 4.8,
    totalReviews: 24,
    joinedDate: '15 | 01 | 2024',
    kycStatus: 'verified',
    salesUgx: 2450000,
    investedUgx: 1800000,
  });

  const [mockCreatedCampaigns, setMockCreatedCampaigns] = useState<CampaignProfile[]>([
    {
      id: 'cc_1',
      name: 'PortVille Early Sellers Sprint',
      ownerName: 'Mukisa Calcus',
      employerAccountId: 'acc-usr_9481a82f',
      budgetUgx: 5000000,
      remainingUgx: 1200000,
      budgetUsed: 3800000,
      totalBudget: 5000000,
      budgetPercentAvailable: 24,
      viewsGenerated: 1850000,
      cpm: 1200,
      amount: 1200000,
      membersCount: 48,
      status: 'active',
      statusLabel: 'Active',
      stars: 127,
      isStarred: false,
      viewerIsOwner: true,
      canJoin: false,
      canLeave: false,
      members: [
        { userId: 'usr_1', name: 'Sarah Akello', rank: 'Gold Member', amount: 250000 },
        { userId: 'usr_2', name: 'David Ochieng', rank: 'Silver Member', amount: 180000 },
      ],
      profileOwner: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
      viewer: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
    },
    {
      id: 'cc_2',
      name: 'Uganda Craft Traders Network',
      ownerName: 'Mukisa Calcus',
      employerAccountId: 'acc-usr_9481a82f',
      budgetUgx: 2000000,
      remainingUgx: 350000,
      budgetUsed: 1650000,
      totalBudget: 2000000,
      budgetPercentAvailable: 18,
      viewsGenerated: 1240000,
      cpm: 950,
      amount: 350000,
      membersCount: 19,
      status: 'paused',
      statusLabel: 'Paused',
      stars: 84,
      isStarred: false,
      viewerIsOwner: true,
      canJoin: false,
      canLeave: false,
      members: [
        { userId: 'usr_3', name: 'Grace Lamwaka', rank: 'Gold Member', amount: 150000 },
        { userId: 'usr_4', name: 'John Okello', rank: 'Silver Member', amount: 120000 },
      ],
      profileOwner: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
      viewer: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
    },
    {
      id: 'cc_3',
      name: 'Kampala Urban Wear Drop',
      ownerName: 'Mukisa Calcus',
      employerAccountId: 'acc-usr_9481a82f',
      budgetUgx: 1500000,
      remainingUgx: 0,
      budgetUsed: 1500000,
      totalBudget: 1500000,
      budgetPercentAvailable: 0,
      viewsGenerated: 890000,
      cpm: 800,
      amount: 0,
      membersCount: 32,
      status: 'ended',
      statusLabel: 'Ended',
      stars: 56,
      isStarred: false,
      viewerIsOwner: true,
      canJoin: false,
      canLeave: false,
      members: [
        { userId: 'usr_5', name: 'Rebecca Nanyondo', rank: 'Gold Member', amount: 200000 },
        { userId: 'usr_6', name: 'Paul Ssebuwufu', rank: 'Silver Member', amount: 150000 },
      ],
      profileOwner: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
      viewer: { name: 'Mukisa Calcus', rank: 'Top Seller', isMember: true },
    },
  ]);

  const [mockJoinedCampaigns, setMockJoinedCampaigns] = useState<CampaignProfile[]>([
    {
      id: 'jc_1',
      name: 'Kampala Tech Expo Promo',
      ownerName: 'Sarah Akello',
      ownerUsername: 'sarahakello',
      ownerAccountId: 'acc-sarah-akello',
      employerAccountId: 'acc-sarah-akello',
      budgetUgx: 3000000,
      remainingUgx: 500000,
      budgetUsed: 2500000,
      totalBudget: 3000000,
      budgetPercentAvailable: 17,
      viewsGenerated: 965000,
      cpm: 1100,
      amount: 500000,
      membersCount: 24,
      status: 'active',
      statusLabel: 'Active',
      stars: 45,
      isStarred: false,
      viewerIsOwner: false,
      canJoin: false,
      canLeave: true,
      members: [
        { userId: 'usr_9', name: 'Sarah Akello', rank: 'Gold Member', amount: 200000 },
        { userId: 'usr_10', name: 'Mukisa Calcus', rank: 'Silver Member', amount: 100000 },
      ],
      profileOwner: { name: 'Sarah Akello', rank: 'Gold Member', isMember: true },
      viewer: { name: 'Mukisa Calcus', rank: 'Silver Member', isMember: true },
    },
    {
      id: 'jc_2',
      name: 'Uganda Farmers Market',
      ownerName: 'David Ochieng',
      ownerUsername: 'david.ochieng',
      ownerAccountId: 'acc-david-ochieng',
      employerAccountId: 'acc-david-ochieng',
      budgetUgx: 1000000,
      remainingUgx: 200000,
      budgetUsed: 800000,
      totalBudget: 1000000,
      budgetPercentAvailable: 20,
      viewsGenerated: 345000,
      cpm: 700,
      amount: 200000,
      membersCount: 12,
      status: 'paused',
      statusLabel: 'Paused',
      stars: 23,
      isStarred: false,
      viewerIsOwner: false,
      canJoin: false,
      canLeave: true,
      members: [
        { userId: 'usr_11', name: 'David Ochieng', rank: 'Gold Member', amount: 80000 },
        { userId: 'usr_12', name: 'Mukisa Calcus', rank: 'Bronze Member', amount: 50000 },
      ],
      profileOwner: { name: 'David Ochieng', rank: 'Bronze Member', isMember: true },
      viewer: { name: 'Mukisa Calcus', rank: 'Bronze Member', isMember: true },
    },
  ]);

  const viewerId = session?.user?.id;
  const targetId = profileAccountId ?? viewerId;
  const accountId = targetId ? (targetId.startsWith('acc-') ? targetId : `acc-${targetId}`) : undefined;
  const mockTarget = profileAccountId
    ? getMockPublicProfile(profileAccountId)
    : getMockPublicProfile(session?.user?.name ?? session?.user?.email ?? 'mukisacalcus');
  const viewerName = session?.user?.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isOwnProfile = !profileAccountId || profileAccountId.replace(/^acc-/, '') === viewerId || Boolean(mockTarget && viewerName === mockTarget.username.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const isMukisaViewing = viewerName === 'mukisacalcus';
  const mockViewerIdsByName: Record<string, string[]> = {
    mukisacalcus: ['usr_9481a82f', 'acc-usr_9481a82f'],
    sarahakello: ['usr_1', 'usr_9', 'acc-sarah-akello'],
    paulssebuwufu: ['usr_6', 'acc-usr_6'],
    davidocheing: ['usr_2', 'usr_11', 'acc-david-ochieng'],
    gracelamwaka: ['usr_3', 'acc-usr_3'],
    johnokello: ['usr_4', 'acc-usr_4'],
    rebeccananyondo: ['usr_5', 'acc-usr_5'],
  };
  const viewerIdentityIds = new Set([viewerId, viewerId ? `acc-${viewerId}` : '', ...(mockViewerIdsByName[viewerName ?? ''] ?? ['usr_9481a82f', 'acc-usr_9481a82f'])].filter(Boolean));
  const resolvedMockTarget = mockTarget ?? getMockPublicProfile(normalizeMockCampaignIdentity(viewerName ?? 'mukisacalcus').username);

  useEffect(() => {
    setMockMembershipOverrides(getMockCampaignMembershipOverrides(viewerName ?? 'mukisacalcus'));
  }, [viewerName]);
  const sampleJobs = [
    { id: 'job-sample-1', title: 'Growth Marketing Specialist', description: 'Plan digital growth campaigns and measure community reach.', location: 'Kampala, Uganda', employerName: 'PortVille Studio', employerAccountId: 'acc-employer-17', requiredPeople: 2, applicants: 18, accepted: 1, status: 'active', minSalary: 700000, maxSalary: 1200000, salaryPeriod: 'month' },
    { id: 'job-sample-2', title: 'Community Campaign Coordinator', description: 'Coordinate local creators and keep weekly campaigns on track.', location: 'Entebbe, Uganda', employerName: 'Kampala Creative Hub', employerAccountId: 'acc-employer-24', requiredPeople: 1, applicants: 9, accepted: 0, status: 'active', minSalary: 180000, maxSalary: 250000, salaryPeriod: 'week' },
    { id: 'job-sample-3', title: 'Visual Content Designer', description: 'Create social visuals and short-form assets for product launches.', location: 'Remote · Uganda', employerName: 'Lakeview Digital', employerAccountId: 'acc-employer-31', requiredPeople: 3, applicants: 14, accepted: 2, status: 'paused', minSalary: 40000, maxSalary: 65000, salaryPeriod: 'day' },
  ];
  const targetSlug = profileAccountId?.replace(/^acc-/, '').toLowerCase();
  const mockCampaignForTarget = targetSlug === 'david-ochieng'
    ? mockJoinedCampaigns[1]
    : targetSlug === 'sarah-akello'
      ? mockJoinedCampaigns[0]
      : null;
  const viewedCampaignFallback = isOwnProfile
    ? mockCreatedCampaigns
    : mockCampaignForTarget
      ? [isMukisaViewing ? mockCampaignForTarget : {
          ...mockCampaignForTarget,
          canJoin: mockCampaignForTarget.status === 'active',
          canLeave: false,
          viewerLeader: null,
          members: mockCampaignForTarget.members.filter((member) => !member.name.toLowerCase().includes('mukisa')),
        }]
      : mockTarget?.username === 'mukisacalcus'
        ? mockCreatedCampaigns.map((campaign) => ({
            ...campaign,
            viewerIsOwner: false,
            canJoin: campaign.status === 'active',
            canLeave: false,
            isStarred: false,
            viewerLeader: null,
          }))
        : [];
  const profileIdentityIds = new Set([
    resolvedMockTarget?.accountId ?? '',
    ...(resolvedMockTarget ? (mockViewerIdsByName[resolvedMockTarget.username.toLowerCase().replace(/[^a-z0-9]/g, '')] ?? []) : []),
  ]);
  const mapMockCampaign = (campaign: MockCampaignFixture): CampaignProfile => {
    const profileCreatedCampaign = campaign.owner.id === resolvedMockTarget?.accountId || profileIdentityIds.has(campaign.owner.id);
    const viewerIsCampaignOwner = viewerIdentityIds.has(campaign.owner.id) || viewerIdentityIds.has(campaign.owner.accountId);
    const participants = campaign.participants.map((person) => ({
      person,
      metrics: campaign.participantMetrics[person.id],
    })).sort((a, b) => (a.metrics?.rank ?? 999) - (b.metrics?.rank ?? 999));
    const viewer = participants.find(({ person }) => viewerIdentityIds.has(person.id) || viewerIdentityIds.has(person.accountId));
    const profileOwner = participants.find(({ person }) => profileIdentityIds.has(person.id) || profileIdentityIds.has(person.accountId));
    const viewerIsMember = !viewerIsCampaignOwner && (mockMembershipOverrides[campaign.id] ?? Boolean(viewer));
    const profileIsMember = profileCreatedCampaign || Boolean(profileOwner);
    const usedPercent = campaign.budget > 0 ? Math.round((campaign.budgetUsed / campaign.budget) * 100) : 0;
    return {
      id: campaign.id,
      name: campaign.name,
      ownerName: campaign.owner.name,
      ownerUsername: campaign.owner.username,
      ownerAccountId: campaign.owner.accountId,
      employerAccountId: campaign.owner.accountId,
      budgetUgx: campaign.budget,
      remainingUgx: Math.max(0, campaign.budget - campaign.budgetUsed),
      budgetUsed: campaign.budgetUsed,
      totalBudget: campaign.budget,
      budgetPercentAvailable: Math.max(0, Math.min(100, usedPercent)),
      viewsGenerated: campaign.views,
      cpm: campaign.cpm,
      amount: viewer?.metrics?.amount ?? 0,
      membersCount: campaign.participants.length,
      status: campaign.status.toLowerCase() === 'expired' ? 'ended' : campaign.status.toLowerCase(),
      statusLabel: campaign.status,
      stars: campaign.stars,
      isStarred: false,
      viewerIsOwner: viewerIsCampaignOwner,
      canJoin: !viewerIsCampaignOwner && !viewerIsMember && campaign.status === 'Active',
      canLeave: viewerIsMember && campaign.status !== 'Expired',
      members: participants.slice(0, 2).map(({ person, metrics }) => ({ userId: person.id, name: person.name, rank: metrics?.rank ?? 99, views: metrics?.views ?? 0, amount: metrics?.amount ?? 0 })),
      viewerLeader: viewer && (viewer.metrics?.rank ?? 99) > 2 ? { userId: viewer.person.id, name: viewer.person.name, rank: viewer.metrics?.rank ?? 99, views: viewer.metrics?.views ?? 0, amount: viewer.metrics?.amount ?? 0 } : null,
      profileOwner: { name: resolvedMockTarget?.name ?? campaign.owner.name, rank: profileCreatedCampaign ? 'Creator' : profileOwner ? `Member #${profileOwner.metrics?.rank ?? 99}` : 'Not joined', isMember: profileIsMember },
      viewer: { name: session?.user?.name ?? 'Visitor', rank: viewer ? `Member #${viewer.metrics?.rank ?? 99}` : 'Not joined', isMember: viewerIsMember },
    };
  };
  const mockProfileCampaigns = getMockProfileCampaignFixtures(profileAccountId ?? viewerName ?? 'mukisacalcus', isOwnProfile ? mockMembershipOverrides : {});
  const targetMockCreatedCampaigns = mockProfileCampaigns.created.map(mapMockCampaign);
  const targetMockJoinedCampaigns = mockProfileCampaigns.joined.map(mapMockCampaign);
  const displayedCreatedCampaigns = createdCampaigns.length > 0 ? createdCampaigns : viewedCampaignFallback;
  const createdFixtureFallback = targetMockCreatedCampaigns.length ? targetMockCreatedCampaigns : displayedCreatedCampaigns;
  const joinedFixtureFallback = targetMockJoinedCampaigns.length ? targetMockJoinedCampaigns : isOwnProfile ? mockJoinedCampaigns : [];
  const displayedCreatedProfileCampaigns = [...createdFixtureFallback, ...createdCampaigns.filter((campaign) => !createdFixtureFallback.some((mockCampaign) => mockCampaign.id === campaign.id))];
  const displayedJoinedCampaigns = [...joinedFixtureFallback, ...joinedCampaigns.filter((campaign) => !joinedFixtureFallback.some((mockCampaign) => mockCampaign.id === campaign.id))];
  const mockProfileJobs: DiscoverJob[] = mockTarget ? mockTarget.discoverJobs.map((job, index) => ({
    id: `mock-${targetSlug}-job-${index + 1}`,
    title: job.title,
    description: `${mockTarget.name} is looking for a ${job.title.toLowerCase()} to support local campaigns.`,
    location: 'Kampala, Uganda',
    employerName: mockTarget.name,
    employerAccountId: mockTarget.accountId,
    requiredPeople: job.vacants,
    applicants: 8 + index * 5,
    accepted: job.recruited,
    status: 'active',
    minSalary: 450000,
    maxSalary: 850000,
    salaryPeriod: 'month',
    applicationStatus: null,
  })) : [];
  const displayedJobs = createdJobs.length > 0 ? createdJobs : mockTarget ? mockProfileJobs : sampleJobs;

  const loadCampaigns = useCallback(async () => {
    if (!accountId) return;
    setIsLoadingCampaigns(true);
    setCampaignError('');
    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(accountId)}/campaigns`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not load campaigns.');
      setCreatedCampaigns(payload.createdCampaigns ?? []);
      setJoinedCampaigns(payload.joinedCampaigns ?? []);
      setCreatedJobs(payload.jobs ?? []);
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Could not load campaigns.');
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!accountId) return;
    let active = true;
    fetch(`/api/profile/${encodeURIComponent(accountId)}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load profile.');
        if (!active) return;
        setUserData((current) => ({
          ...current,
          id: String(data.accountId ?? accountId),
          name: data.name ?? current.name,
          legalName: data.legalName ?? data.name ?? current.legalName,
          username: data.username ?? current.username,
          avatarUrl: data.avatarUrl ?? null,
          rating: Number(data.rating ?? current.rating),
          totalReviews: Number(data.totalRatings ?? current.totalReviews),
          joinedDate: data.dateJoined ?? current.joinedDate,
          kycStatus: data.verified ? 'verified' : data.kycStatus === 'pending' ? 'pending' : 'unverified',
          salesUgx: Number(data.sales ?? current.salesUgx),
          investedUgx: Number(data.invested ?? current.investedUgx),
        }));
      })
      .catch((error) => {
        if (active) setCampaignError(error instanceof Error ? error.message : 'Could not load profile.');
      });
    return () => { active = false; };
  }, [accountId]);

  useEffect(() => {
    if (!session?.user || profileAccountId) return;
    setUserData((current) => ({
      ...current,
      id: session.user.id,
      name: session.user.name ?? current.name,
      legalName: session.user.name ?? current.legalName,
      username: current.username || session.user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '',
      avatarUrl: session.user.image ?? null,
    }));
  }, [profileAccountId, session]);

  useEffect(() => { void loadCampaigns(); }, [loadCampaigns]);

  const handleCampaignAction = async (campaignId: string, action: 'join' | 'leave' | 'star' | 'pause' | 'activate' | 'end') => {
    if (!/^\d+$/.test(campaignId)) {
      if (action === 'join' || action === 'leave') {
        setMockCampaignMembership(campaignId, viewerName ?? 'mukisacalcus', action === 'join');
        setMockMembershipOverrides((previous) => ({ ...previous, [campaignId]: action === 'join' }));
      }
      const updateMockCampaign = (campaign: CampaignProfile): CampaignProfile => {
        if (action === 'join') {
          const alreadyListed = campaign.members.some((member) => member.name.toLowerCase().replace(/[^a-z0-9]/g, '') === viewerName);
          return {
            ...campaign,
            canJoin: false,
            canLeave: true,
            membersCount: campaign.membersCount + (campaign.canJoin ? 1 : 0),
            viewerLeader: alreadyListed ? campaign.viewerLeader : {
              userId: viewerId ?? 'mock-viewer',
              name: session?.user?.name ?? 'You',
              rank: campaign.membersCount + 1,
              views: 0,
              amount: 0,
            },
          };
        }
        if (action === 'leave') return { ...campaign, canJoin: campaign.status === 'active', canLeave: false, membersCount: Math.max(0, campaign.membersCount - 1), viewerLeader: null };
        if (action === 'star') return { ...campaign, isStarred: true, stars: campaign.stars + 1 };
        if (action === 'pause' || action === 'activate' || action === 'end') {
          const status = action === 'pause' ? 'paused' : action === 'activate' ? 'active' : 'ended';
          return { ...campaign, status, statusLabel: status[0].toUpperCase() + status.slice(1), canJoin: false, canLeave: status === 'ended' ? false : campaign.canLeave };
        }
        return campaign;
      };
      setCreatedCampaigns((previous) => {
        const source = previous.length ? previous : displayedCreatedProfileCampaigns;
        return source.some((campaign) => campaign.id === campaignId) ? source.map((campaign) => campaign.id === campaignId ? updateMockCampaign(campaign) : campaign) : previous;
      });
      setJoinedCampaigns((previous) => {
        const source = previous.length ? previous : displayedJoinedCampaigns;
        return source.some((campaign) => campaign.id === campaignId) ? source.map((campaign) => campaign.id === campaignId ? updateMockCampaign(campaign) : campaign) : previous;
      });
      setMockCreatedCampaigns((previous) => previous.map((campaign) => campaign.id === campaignId ? updateMockCampaign(campaign) : campaign));
      setMockJoinedCampaigns((previous) => previous.map((campaign) => campaign.id === campaignId ? updateMockCampaign(campaign) : campaign));
      return;
    }
    try {
      const response = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Campaign update failed.');
      await loadCampaigns();
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Campaign update failed.');
    }
  };

  const handleJobStatusToggle = async (jobId: string, nextStatus: 'apply' | 'paused') => {
    try {
      const response = await fetch(`/api/discover/${encodeURIComponent(jobId)}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Job status update failed.');
      await loadCampaigns();
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Job status update failed.');
    }
  };

  const handleApplyToProfileJob = async (job: DiscoverJob) => {
    if (!hasSavedCvData()) {
      recordOfficeEvent({
        type: 'application',
        title: 'CV needed before applying',
        description: `Complete your CV before applying to ${job.title}.`,
        status: 'pending',
        meta: { jobId: job.id, title: job.title },
      });
      router.push('/office/resume');
      return;
    }

    let updatedApplicants = job.applicants;
    if (/^\d+$/.test(job.id)) {
      const response = await fetch(`/api/discover/${encodeURIComponent(job.id)}/applications`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        setCampaignError(result.error || 'Unable to submit application.');
        return;
      }
      updatedApplicants = result.applicants ?? updatedApplicants + 1;
    }

    setCreatedJobs((previous) => (previous.length ? previous : displayedJobs).map((item) => item.id === job.id ? {
      ...item,
      applicants: updatedApplicants,
      applicationStatus: 'pending',
    } : item));
    recordOfficeEvent({
      type: 'application',
      title: 'Application submitted',
      description: `You applied to ${job.title} at ${job.employerName}.`,
      status: 'submitted',
      meta: { jobId: job.id, title: job.title },
    });
  };

  const handleVerify = () => setUserData((current) => ({ ...current, kycStatus: 'pending' }));
  const handleSaveProfile = (data: { name: string; username: string }) => {
    setUserData((current) => ({ ...current, name: data.name, username: data.username }));
  };

  const handleRatingSubmit = (rating: number) => {
    setUserData((current) => ({ ...current, rating, totalReviews: current.totalReviews + 1 }));
  };

  if (status === 'loading') {
    return <div className="flex min-h-[60vh] items-center justify-center bg-black text-zinc-400">Loading profile...</div>;
  }
  if (!session?.user) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-black text-zinc-400">Please sign in to view this profile.</div>;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black pb-12 font-sans text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-6">
        <div className="flex flex-1 flex-col gap-6 min-[501px]:flex-row">
          <aside className="w-full space-y-6 min-[501px]:sticky min-[501px]:top-20 min-[501px]:max-h-[calc(100vh-5rem)] min-[501px]:self-start min-[501px]:overflow-y-auto min-[501px]:w-[40%] min-[501px]:shrink-0 min-[501px]:pr-1 xl:w-1/4">
            <ProfileHeader userData={userData} onEdit={() => setIsEditing(true)} onVerify={handleVerify} isOwnProfile={isOwnProfile} />
            <AccountSummary userData={userData} formatCurrency={formatCurrency} isOwnProfile={isOwnProfile} onRatingSubmit={handleRatingSubmit} accountId={accountId} viewerId={viewerId} viewerName={session?.user?.name ?? 'PortVille member'} viewerImage={session?.user?.image ?? null} />
          </aside>

          <section className="hidden min-w-0 flex-1 min-[501px]:flex min-[501px]:flex-col">
            <div className="hidden flex-1 min-[501px]:flex min-[501px]:flex-col xl:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex rounded-xl bg-zinc-900 p-1 text-xs font-semibold">
                  {([
                    ['created', 'Created'],
                    ['joined', 'Joined'],
                    ['jobs', 'Jobs'],
                  ] as const).map(([tab, label]) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg py-2 text-center transition ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {campaignError && <p role="alert" className="text-sm text-rose-300">{campaignError}</p>}
                {isLoadingCampaigns ? <p className="py-4 text-center text-sm text-zinc-500">Loading campaign activity…</p> : (
                  <div className="min-h-0 h-full overflow-y-auto pr-1">
                    {activeTab === 'created' && <CreatedCampaigns campaigns={displayedCreatedProfileCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />}
                    {activeTab === 'joined' && <JoinedCampaigns campaigns={displayedJoinedCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />}
                    {activeTab === 'jobs' && <DiscoverJobs jobs={displayedJobs} currentAccountId={viewerId ? `acc-${viewerId}` : undefined} canReviewApplicants={isOwnProfile} onApply={handleApplyToProfileJob} onToggleStatus={handleJobStatusToggle} />}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden min-h-0 min-w-0 flex-1 xl:grid xl:grid-cols-3 xl:grid-rows-1 xl:gap-6">
              <div className={`flex min-h-0 flex-col ${focusedTab === 'created' ? 'xl:col-span-3' : 'hidden'}`}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Created</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">{displayedCreatedProfileCampaigns.length}</span>
                    <button type="button" onClick={() => setFocusedTab(null)} className="rounded-md border border-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white">
                      Unfocus
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <CreatedCampaigns campaigns={displayedCreatedProfileCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />
                </div>
              </div>

              <div className={`flex min-h-0 flex-col ${focusedTab === 'joined' ? 'xl:col-span-3' : 'hidden'}`}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Joined</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">{displayedJoinedCampaigns.length}</span>
                    <button type="button" onClick={() => setFocusedTab(null)} className="rounded-md border border-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white">
                      Unfocus
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <JoinedCampaigns campaigns={displayedJoinedCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />
                </div>
              </div>

              <div className={`flex min-h-0 flex-col ${focusedTab === 'jobs' ? 'xl:col-span-3' : 'hidden'}`}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Jobs</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">0</span>
                    <button type="button" onClick={() => setFocusedTab(null)} className="rounded-md border border-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white">
                      Unfocus
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <DiscoverJobs jobs={displayedJobs} currentAccountId={viewerId ? `acc-${viewerId}` : undefined} canReviewApplicants={isOwnProfile} onApply={handleApplyToProfileJob} onToggleStatus={handleJobStatusToggle} />
                </div>
              </div>

              {focusedTab === null && (
                <>
                  <div className="flex min-h-0 flex-col">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Created</h3>
                      <span className="text-[11px] text-zinc-500">{displayedCreatedProfileCampaigns.length}</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      <CreatedCampaigns campaigns={displayedCreatedProfileCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Joined</h3>
                      <span className="text-[11px] text-zinc-500">{displayedJoinedCampaigns.length}</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      <JoinedCampaigns campaigns={displayedJoinedCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Jobs</h3>
                      <span className="text-[11px] text-zinc-500">0</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      <DiscoverJobs jobs={displayedJobs} currentAccountId={viewerId ? `acc-${viewerId}` : undefined} canReviewApplicants={isOwnProfile} onApply={handleApplyToProfileJob} onToggleStatus={handleJobStatusToggle} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      <div className="min-[501px]:hidden">
        <main className="mx-auto max-w-2xl px-4 pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex rounded-xl bg-zinc-900 p-1 text-xs font-semibold">
              {([
                ['created', 'Created'],
                ['joined', 'Joined'],
                ['jobs', 'Jobs'],
              ] as const).map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg py-2 text-center transition ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            {campaignError && <p role="alert" className="text-sm text-rose-300">{campaignError}</p>}
            {isLoadingCampaigns ? <p className="py-4 text-center text-sm text-zinc-500">Loading campaign activity…</p> : (
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                {activeTab === 'created' && <CreatedCampaigns campaigns={displayedCreatedProfileCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />}
                {activeTab === 'joined' && <JoinedCampaigns campaigns={displayedJoinedCampaigns} formatCurrency={formatCurrency} onAction={handleCampaignAction} />}
                {activeTab === 'jobs' && <DiscoverJobs jobs={displayedJobs} currentAccountId={viewerId ? `acc-${viewerId}` : undefined} canReviewApplicants={isOwnProfile} onApply={handleApplyToProfileJob} onToggleStatus={handleJobStatusToggle} />}
              </div>
            )}
          </div>
        </main>
      </div>

      {isOwnProfile && <EditProfileModal isOpen={isEditing} userData={userData} onClose={() => setIsEditing(false)} onSave={handleSaveProfile} />}
    </div>
  );
}
