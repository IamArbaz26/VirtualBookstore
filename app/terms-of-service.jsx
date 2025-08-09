import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-700">
        Welcome to <strong>Bookish</strong> – your destination for discovering, buying, and sharing Pakistani literature. By using our website, you agree to the following terms, which are designed to ensure a safe and enjoyable experience for all users.
      </p>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">1. Using Bookish</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Bookish is a platform for readers, authors, and book lovers to connect and share their passion for literature.</li>
        <li>Users must provide accurate information during registration and checkout.</li>
        <li>Do not misuse the platform or engage in prohibited activities (spam, abuse, copyright infringement, etc.).</li>
      </ul>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">2. Purchases & Refunds</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>All sales are final unless otherwise stated. Please review your order before confirming.</li>
        <li>Contact our support team for any issues with your order or to request a refund (where applicable).</li>
      </ul>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">3. Community Guidelines</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Respect other users and authors in the community.</li>
        <li>Do not post offensive, illegal, or inappropriate content.</li>
        <li>Bookish reserves the right to moderate or remove content that violates our guidelines.</li>
      </ul>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">4. Changes to Terms</h2>
      <p className="mb-4 text-gray-700">We may update these terms from time to time. Continued use of Bookish means you accept the new terms.</p>
      <p className="text-gray-600 mt-8">For questions, contact us at <a href="mailto:info@bookish.pk" className="text-teal-600 underline">info@bookish.pk</a>.</p>
      <Link href="/" className="inline-block mt-8 text-teal-700 hover:underline font-semibold">← Back to Home</Link>
    </div>
  );
} 