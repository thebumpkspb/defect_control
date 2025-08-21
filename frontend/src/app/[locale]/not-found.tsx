import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md text-center px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
