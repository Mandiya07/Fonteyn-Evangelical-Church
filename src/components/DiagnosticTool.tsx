import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Database, Cloud } from 'lucide-react';

export default function DiagnosticTool() {
  const [status, setStatus] = useState<any>(null);

  const runDiagnostic = async () => {
    try {
      const res = await fetch('/api/diagnostic');
      const data = await res.json();
      setStatus(data);
    } catch (e: any) {
      setStatus({ error: e.message });
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (!status) return <div className="p-4 bg-gray-50 rounded-xl text-sm animate-pulse">Running diagnostics...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-150 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Server className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">System Diagnostic Status</h2>
      </div>
      
      {status.error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg font-mono text-sm">
          {status.error}
        </div>
      ) : (
        <div className="space-y-4 font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-150">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-gray-700">
                <Database className="w-4 h-4" /> Database (Firestore)
              </h3>
              <p>Project ID: <span className="text-blue-600">{status.projectId}</span></p>
              <p>Admin SDK: {status.adminSdk ? <span className="text-green-600">Connected</span> : <span className="text-orange-500">Not Initialized</span>}</p>
              <p>Client SDK: {status.clientSdk ? <span className="text-green-600">Connected</span> : <span className="text-red-600">Failed</span>}</p>
              <p>Demo Data Present: {status.demoDataCount > 0 ? <span className="text-green-600">Yes ({status.demoDataCount} records)</span> : <span className="text-orange-500">No</span>}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-150">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-gray-700">
                <Cloud className="w-4 h-4" /> Storage Services
              </h3>
              <p>Storage Bucket: <span className="text-blue-600">{status.storageBucket || 'Not configured'}</span></p>
              <p>Admin Storage: {status.adminStorage ? <span className="text-green-600">Available</span> : <span className="text-orange-500">Unavailable</span>}</p>
              <p>Client Storage: {status.clientStorage ? <span className="text-green-600">Available</span> : <span className="text-red-600">Unavailable</span>}</p>
              <p>Environment: {status.isVercel ? <span className="text-purple-600">Vercel Serverless</span> : <span className="text-blue-600">Standard Node.js</span>}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4 text-blue-800 text-xs font-sans">
            <p><strong>Note:</strong> The data currently visible in this app is being pulled directly from the Firebase Firestore database (Project: {status.projectId}). The demo data you see was persisted to Firestore during initial setup. If this data is missing on Vercel, it may be due to Vercel Serverless configuration differences or Firebase permissions. Ensure you have redeployed the latest code to Vercel after the Firebase integration.</p>
          </div>
        </div>
      )}
    </div>
  );
}
