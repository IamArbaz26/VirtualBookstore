import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">
        <strong>Bookish</strong> is Pakistan's premier online bookstore and literary community. We are dedicated to connecting readers with the best of Pakistani literature, both in print and digital form. Your privacy is important to us, and we are committed to protecting your personal information.
      </p>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">What Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Your email address for newsletter subscriptions and account creation</li>
        <li>Order and payment details for purchases</li>
        <li>Community posts, reviews, and ratings you submit</li>
        <li>Basic analytics to improve our website and services</li>
      </ul>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>To process your orders and send you updates</li>
        <li>To personalize your experience and recommend books</li>
        <li>To send newsletters and important notifications (you can unsubscribe anytime)</li>
        <li>To improve our website and community features</li>
      </ul>
      <h2 className="text-xl font-semibold text-teal-600 mt-6 mb-2">Your Rights & Choices</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>You can request deletion of your data at any time by contacting us</li>
        <li>You can unsubscribe from emails via the link in any newsletter</li>
        <li>Your data is never sold or shared with third parties for marketing</li>
      </ul>
      <p className="text-gray-600 mt-8">
        For questions or privacy requests, contact us at <a href="mailto:info@bookish.pk" className="text-teal-600 underline">info@bookish.pk</a>.
      </p>
      <Link href="/" className="inline-block mt-8 text-teal-700 hover:underline font-semibold">← Back to Home</Link>
    </div>
  );
} 