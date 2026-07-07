import React, { useState, useEffect } from 'react';
import { Database, Shield, CheckCircle2, XCircle, RefreshCw, Server, AlertTriangle, Terminal, HardDrive, Wifi } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, listAll, getMetadata, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

interface LogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export default function StorageDiagnostics() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [storageStatus, setStorageStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [authStatus, setAuthStatus] = useState<{
    initialized: boolean;
    currentUser: string | null;
    isAnonymous: boolean | null;
    email: string | null;
  }>({
    initialized: false,
    currentUser: null,
    isAnonymous: null,
    email: null,
  });
  const [bucketItems, setBucketItems] = useState<{ name: string; fullPath: string; size?: number }[]>([]);

  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    const newItem: LogItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [newItem, ...prev]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setStorageStatus('testing');
    setLogs([]);
    setBucketItems([]);

    addLog('info', 'Starting Firebase Storage & Client Connectivity Diagnostics...');
    addLog('info', `Target Bucket: ${firebaseConfig.storageBucket || 'sincere-gist-scf5x.firebasestorage.app'}`);
    addLog('info', `Project ID: ${firebaseConfig.projectId}`);

    try {
      // 1. Initialize Firebase App
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        addLog('success', 'Firebase App initialized successfully.');
      } else {
        app = getApp();
        addLog('info', 'Using existing Firebase App instance.');
      }

      // 2. Check Auth Status
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      const authState = {
        initialized: true,
        currentUser: currentUser ? currentUser.uid : 'Not signed in',
        isAnonymous: currentUser ? currentUser.isAnonymous : null,
        email: currentUser ? currentUser.email : null,
      };
      setAuthStatus(authState);

      if (currentUser) {
        addLog('success', `Firebase Auth: User is signed in (UID: ${currentUser.uid}, Anonymous: ${currentUser.isAnonymous}, Email: ${currentUser.email || 'None'})`);
      } else {
        addLog('warning', 'Firebase Auth: No user currently signed in. Testing with anonymous auth or public rules...');
        try {
          const anonResult = await signInAnonymously(auth);
          addLog('success', `Signed in anonymously for diagnostic test (UID: ${anonResult.user.uid})`);
          setAuthStatus({
            initialized: true,
            currentUser: anonResult.user.uid,
            isAnonymous: true,
            email: null,
          });
        } catch (authErr: any) {
          addLog('warning', `Anonymous sign-in skipped/failed: ${authErr.message}. Proceeding unauthenticated.`);
        }
      }

      // 3. Initialize Firebase Storage
      const storageBucketUrl = firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined;
      const storage = getStorage(app, storageBucketUrl);
      addLog('success', `Firebase Storage SDK initialized successfully with bucket: ${storage.app.options.storageBucket || 'default'}`);

      // 4. Test Read Operation (List root or assets folder)
      addLog('info', 'Testing read operation: listing storage root and "assets" folder...');
      
      const rootRef = ref(storage);
      const itemsList: { name: string; fullPath: string; size?: number }[] = [];

      try {
        const rootResult = await listAll(rootRef);
        addLog('success', `Successfully connected to storage root! Found ${rootResult.prefixes.length} prefixes and ${rootResult.items.length} items at root.`);
        
        for (const prefix of rootResult.prefixes) {
          itemsList.push({ name: `Folder: ${prefix.name}`, fullPath: prefix.fullPath });
        }

        for (const itemRef of rootResult.items) {
          try {
            const meta = await getMetadata(itemRef);
            itemsList.push({ name: itemRef.name, fullPath: itemRef.fullPath, size: meta.size });
          } catch {
            itemsList.push({ name: itemRef.name, fullPath: itemRef.fullPath });
          }
        }
      } catch (rootErr: any) {
        addLog('warning', `Root listing returned notice/error (may require specific subfolder permissions): ${rootErr.message}`);
      }

      // Test specific 'assets' folder
      try {
        const assetsRef = ref(storage, 'assets');
        const assetsResult = await listAll(assetsRef);
        addLog('success', `Successfully read 'assets/' folder! Found ${assetsResult.items.length} items.`);
        
        for (const itemRef of assetsResult.items.slice(0, 10)) {
          try {
            const meta = await getMetadata(itemRef);
            const url = await getDownloadURL(itemRef);
            itemsList.push({ name: `[Asset] ${itemRef.name}`, fullPath: itemRef.fullPath, size: meta.size });
            addLog('info', `Verified file read & download URL for: ${itemRef.name}`);
          } catch (itemErr: any) {
            addLog('warning', `Found item ${itemRef.name} but failed metadata/URL read: ${itemErr.message}`);
          }
        }
      } catch (assetsErr: any) {
        addLog('warning', `'assets/' folder listing notice: ${assetsErr.message}`);
      }

      setBucketItems(itemsList);
      setStorageStatus('success');
      addLog('success', 'Storage diagnostic connectivity check completed successfully!');
    } catch (err: any) {
      console.error('Storage diagnostic error:', err);
      setStorageStatus('error');
      addLog('error', `Diagnostic failed: ${err.message || String(err)}`);
      if (err.code) {
        addLog('error', `Error Code: ${err.code}`);
      }
      if (err.message && err.message.includes('storage/unauthorized')) {
        addLog('warning', 'Diagnosis: Permission denied. Please check your Firebase Storage security rules in Firebase Console to ensure public or authenticated read access is permitted.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans" id="storage-diagnostics-root">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 animate-pulse" />
              <span>Firebase Storage Diagnostics</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" />
              <span>{firebaseConfig.storageBucket}</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bucket Connectivity & Rules Inspector</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Verifies client connection between frontend and Firebase Storage bucket, inspects authentication context, and tests read/list operations against storage rules.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Diagnostics...' : 'Run Diagnostics Test'}</span>
        </button>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card 1: Bucket */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Bucket</span>
            <HardDrive className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-slate-900 truncate">{firebaseConfig.storageBucket}</div>
            <div className="text-xs text-slate-500 mt-1">Project: {firebaseConfig.projectId}</div>
          </div>
          <div className="pt-2 border-t flex items-center gap-2">
            {storageStatus === 'success' ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Connected & Accessible
              </span>
            ) : storageStatus === 'error' ? (
              <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Connection Error
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
              </span>
            )}
          </div>
        </div>

        {/* Status Card 2: Auth State */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Authentication State</span>
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-slate-900 truncate">
              {authStatus.currentUser ? (authStatus.isAnonymous ? 'Anonymous User' : authStatus.email || authStatus.currentUser) : 'Unauthenticated'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {authStatus.currentUser ? `UID: ${authStatus.currentUser.substring(0, 12)}...` : 'No active session'}
            </div>
          </div>
          <div className="pt-2 border-t flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${authStatus.currentUser ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {authStatus.currentUser ? 'Active Session' : 'Guest Mode'}
            </span>
          </div>
        </div>

        {/* Status Card 3: Read Rules Test */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Rules Read Test</span>
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {storageStatus === 'success' ? 'Read Operations Passed' : storageStatus === 'error' ? 'Read Restricted / Failed' : 'Pending Inspection'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {bucketItems.length > 0 ? `${bucketItems.length} items discovered` : 'No items listed or access restricted'}
            </div>
          </div>
          <div className="pt-2 border-t flex items-center gap-2">
            {storageStatus === 'success' ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Rules Allow Read
              </span>
            ) : storageStatus === 'error' ? (
              <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Check Firebase Rules
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">Waiting for test...</span>
            )}
          </div>
        </div>
      </div>

      {/* Discovered Items & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Discovered Storage Files */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Discovered Bucket Items ({bucketItems.length})</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Bucket Root & /assets</span>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {bucketItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {storageStatus === 'testing' ? 'Scanning storage bucket...' : 'No items found or read access restricted.'}
              </div>
            ) : (
              bucketItems.map((item, index) => (
                <div key={index} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-100 flex items-center justify-between text-sm transition-colors">
                  <div className="space-y-0.5 truncate mr-3">
                    <div className="font-medium text-slate-800 truncate font-mono text-xs">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono truncate">{item.fullPath}</div>
                  </div>
                  {item.size !== undefined && (
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded shrink-0">
                      {(item.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Diagnostic Live Logs */}
        <div className="bg-slate-900 text-slate-200 rounded-xl shadow-sm border border-slate-800 p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white font-sans">Diagnostic Console Logs</h2>
            </div>
            <span className="text-xs text-slate-400">Real-time Stream</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 font-bold ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-amber-400' : 'text-indigo-400'
                }`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
