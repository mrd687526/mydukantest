import { Suspense } from 'react';
import CustomerAuthForm from '@/components/storefront/customer-auth-form';

export default function CustomerLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <CustomerAuthForm />
      </Suspense>
    </div>
  );
}