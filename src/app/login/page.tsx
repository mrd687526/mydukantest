import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}