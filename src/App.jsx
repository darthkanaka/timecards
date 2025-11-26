import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Timecard from './pages/Timecard';
import Admin from './pages/Admin';
import ApproverDashboard from './pages/ApproverDashboard';
import './index.css';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Contractor Timecard System
        </h1>
        <p className="text-gray-600 mb-6">
          Please use your unique timecard link to submit your hours.
        </p>
        <div className="space-y-3">
          <Link
            to="/admin"
            className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/timecard/:token" element={<Timecard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/approve/:token" element={<ApproverDashboard />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </HashRouter>
  );
}
