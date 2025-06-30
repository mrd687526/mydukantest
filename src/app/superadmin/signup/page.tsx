import { SuperAdminSignupForm } from '@/components/superadmin/signup-form';
import { Suspense } from 'react';

export default function SuperAdminSignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SuperAdminSignupForm />
      </Suspense>
    </div>
  );
}