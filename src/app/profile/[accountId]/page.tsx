import ProfilePage from '@/components/profile/ProfilePage';

export default async function PublicProfilePage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <ProfilePage profileAccountId={accountId} />;
}
