import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';
import { createClient } from '@/integrations/supabase/server';
import { createNewUserAndProfile } from '@/app/actions/superadmin';

export default async function LoginPage() {
  const supabase = createClient();

  // Check if a super admin already exists.
  const { count: superAdminCount, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true }) // `count` is returned directly on the result object
    .eq('role', 'super_admin');

  // If no super admin exists (count is 0), create one.
  if (superAdminCount === 0) {
    console.log("No super admin found. Creating default super admin...");
    await createNewUserAndProfile({
      email: 'superadmin@example.com',
      password: 'password',
      name: 'Super Admin',
      role: 'super_admin',
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}