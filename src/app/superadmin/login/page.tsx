import { Suspense } from 'react';
import SuperAdminLoginForm from '@/components/auth/superadmin-login-form'; // Import the new component

export default function SuperAdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SuperAdminLoginForm />
      </Suspense>
    </div>
  );
}