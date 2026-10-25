import LoginForm from './login-form';

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const callbackUrl = searchParams?.callbackUrl ?? '/discover';
  return <LoginForm callbackUrl={callbackUrl} />;
}
