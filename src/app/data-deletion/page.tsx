export default function DataDeletionPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Data Deletion Instructions
          </h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: July 26, 2024</p>

          <div className="space-y-6 text-gray-700">
            <p>
              We respect your right to privacy and control over your data. You can request the deletion of your CommentFlow account and all associated data at any time. We provide several ways for you to do this.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-2">Method 1: Deleting Your Account in the App</h2>
              <p>
                The most direct way to delete your data is by using the account deletion feature within the application:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Log in to your CommentFlow dashboard.</li>
                <li>Navigate to the "Settings" page.</li>
                <li>Find the "Delete Account" section.</li>
                <li>Follow the on-screen prompts to permanently delete your account and all related data, including your profile information, connected accounts, campaigns, and templates.</li>
              </ol>
              <p className="mt-2 text-sm text-gray-600">
                Please note: This action is irreversible and will permanently remove all your data from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Method 2: Removing the App from Facebook</h2>
              <p>
                When you remove the CommentFlow application from your Facebook account, we receive an automated request to delete your data. We honor this request and will automatically delete all data associated with your account.
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Log in to your Facebook account.</li>
                <li>Go to "Settings & Privacy" &gt; "Settings".</li>
                <li>In the left sidebar, click on "Apps and Websites".</li>
                <li>Find "CommentFlow" (or the name of the app you configured) in your list of active apps and click "Remove".</li>
                <li>Confirm the removal. This will trigger the automatic deletion of your data on our servers.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Method 3: Manual Deletion Request via Email</h2>
              <p>
                If you are unable to use the methods above, you can send a manual data deletion request to our support team.
              </p>
              <p className="mt-2">
                Please send an email to <a href="mailto:privacy@commentflow.app" className="text-blue-600 hover:underline">privacy@commentflow.app</a> with the subject line "Data Deletion Request". In the body of the email, please include the name and email address associated with your CommentFlow account so we can identify your data.
              </p>
              <p className="mt-2">
                We will process your request and confirm the deletion of your data within 30 days.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">What Data is Deleted?</h2>
              <p>
                Upon receiving a deletion request, we will permanently remove the following information:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information (name, email, user ID).</li>
                <li>All connected Facebook Page accounts and their access tokens.</li>
                <li>All automation campaigns, rules, and reports you have created.</li>
                <li>All comment and reply templates.</li>
                <li>Any other data directly associated with your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
              <p>
                If you have any questions about our data deletion process, please contact us at <a href="mailto:privacy@commentflow.app" className="text-blue-600 hover:underline">privacy@commentflow.app</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}