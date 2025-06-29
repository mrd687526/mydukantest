export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Privacy Policy for CommentFlow
          </h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: July 26, 2024</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p>
                Welcome to CommentFlow ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using our service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
              <p>
                To provide our services, we need to collect certain information. This includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong>Personal Identification Information:</strong> When you log in with Facebook, we receive your name and email address to create and manage your account.
                </li>
                <li>
                  <strong>Facebook Page Data:</strong> With your permission, we access data related to the Facebook Pages you manage. This includes:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>A list of your pages to allow you to select which ones to connect (from `pages_show_list` permission).</li>
                    <li>Comments and engagement data on your connected pages' posts to monitor for keywords you define (from `pages_read_engagement` permission).</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>To create and secure your user account.</li>
                <li>To provide the core functionality of our service, which is automating comment management on your Facebook Pages.</li>
                <li>To perform actions on your behalf, such as replying to, hiding, or deleting comments based on the rules you configure (using `pages_manage_posts` permission).</li>
                <li>To generate analytics and reports for you within the application dashboard.</li>
                <li>To communicate with you about your account or our services.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data Sharing and Disclosure</h2>
              <p>
                We do not sell, trade, or rent your personal identification information to others. Your data is used solely to provide the services offered by this application. We will not share your data with third parties except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Data Deletion</h2>
              <p>
                You have the right to request the deletion of your data. You can delete your account and all associated data from the settings page within our application. Alternatively, you can request data deletion by sending an email to <a href="mailto:privacy@commentflow.app" className="text-blue-600 hover:underline">privacy@commentflow.app</a>. We will process your request within 30 days.
              </p>
              <p className="mt-2">
                You can also remove our app's access directly from your Facebook settings by navigating to "Settings & Privacy" &gt; "Settings" &gt; "Apps and Websites". Removing the app will also trigger the deletion of your data from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@commentflow.app" className="text-blue-600 hover:underline">privacy@commentflow.app</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}