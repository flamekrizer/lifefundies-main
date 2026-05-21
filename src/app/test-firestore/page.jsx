'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestFirestorePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-firestore');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Firestore Connection Test
          </h1>

          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing...
              </span>
            ) : (
              'Test Connection'
            )}
          </button>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 dark:text-green-200">
                        Connection Successful!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                        Found {result.existingGuides} existing guides
                      </p>
                      {result.guides && result.guides.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">Guides:</p>
                          <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                            {result.guides.map(guide => (
                              <li key={guide.id}>• {guide.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 dark:text-red-200">
                        Connection Failed
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        Error: {result.error}
                      </p>
                      {result.errorCode && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Code: {result.errorCode}
                        </p>
                      )}
                      {result.stack && (
                        <pre className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 p-2 rounded overflow-x-auto">
                          {result.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What this tests:</strong>
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
              <li>• Firebase SDK initialization on server</li>
              <li>• Firestore read permissions</li>
              <li>• Existing data in guides collection</li>
              <li>• Network connectivity to Firebase</li>
            </ul>
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href="/seed"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center hover:bg-green-700 transition"
            >
              Go to Seeder
            </a>
            <a
              href="/guides"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              View Guides
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
