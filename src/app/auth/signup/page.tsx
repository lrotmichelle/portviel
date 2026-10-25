import SignupForm from '../signup-form';

export default function SignupPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const callbackUrl = searchParams?.callbackUrl ?? '/discover';
  return <SignupForm callbackUrl={callbackUrl} />;
}
