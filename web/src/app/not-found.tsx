import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Go back to Homepage
      </Link>
    </div>
  );
}
