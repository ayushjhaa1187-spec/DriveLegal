'use client';

import React from 'react';
import { CheckCircle, XCircle, WifiOff, Wifi, Info } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  onlineOnly: boolean;
  offlineAvailable: boolean;
  offlineNote?: string;
}

interface OfflineFeatureMatrixProps {
  isOffline?: boolean;
  compact?: boolean;
  className?: string;
}

const FEATURES: Feature[] = [
  {
    id: 'violation-lookup',
    name: 'Violation Lookup',
    description: 'Look up traffic violation types and fines',
    category: 'Core',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'Uses cached violation database',
  },
  {
    id: 'bns-search',
    name: 'BNS 2023 Section Search',
    description: 'Search Bharatiya Nyaya Sanhita sections',
    category: 'Legal',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'Full BNS data available offline',
  },
  {
    id: 'cmvr-rules',
    name: 'CMVR Rules Reference',
    description: 'Central Motor Vehicles Rules lookup',
    category: 'Legal',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'CMVR data cached locally',
  },
  {
    id: 'fine-calculator',
    name: 'Fine Calculator',
    description: 'Calculate penalties for violations',
    category: 'Core',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'All calculations run locally',
  },
  {
    id: 'jurisdiction-contacts',
    name: 'Jurisdiction Contacts',
    description: 'RTO and traffic authority contact details',
    category: 'Jurisdictions',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'Cached contact data for major cities',
  },
  {
    id: 'ai-legal-assistant',
    name: 'AI Legal Assistant',
    description: 'AI-powered legal advice and Q&A',
    category: 'AI',
    onlineOnly: true,
    offlineAvailable: false,
    offlineNote: 'Requires internet connection',
  },
  {
    id: 'real-time-traffic',
    name: 'Live Traffic Updates',
    description: 'Real-time traffic violation news',
    category: 'Live',
    onlineOnly: true,
    offlineAvailable: false,
    offlineNote: 'Requires internet connection',
  },
  {
    id: 'parivahan-sync',
    name: 'Parivahan Portal Sync',
    description: 'Sync challan data from Parivahan',
    category: 'Integration',
    onlineOnly: true,
    offlineAvailable: false,
    offlineNote: 'Requires internet connection',
  },
  {
    id: 'speech-to-text',
    name: 'Speech-to-Text Input',
    description: 'Voice input for queries',
    category: 'Input',
    onlineOnly: false,
    offlineAvailable: false,
    offlineNote: 'Requires Chrome with network for API calls',
  },
  {
    id: 'geo-location',
    name: 'GPS Location Detection',
    description: 'Auto-detect incident location',
    category: 'Input',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'GPS works offline; map display requires internet',
  },
  {
    id: 'lawpack-viewer',
    name: 'LawPack Document Viewer',
    description: 'View and download legal documents',
    category: 'Documents',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'Previously downloaded packs available',
  },
  {
    id: 'case-history',
    name: 'Case History',
    description: 'View your past violations and cases',
    category: 'Core',
    onlineOnly: false,
    offlineAvailable: true,
    offlineNote: 'Locally stored case data',
  },
];

const CATEGORY_ORDER = ['Core', 'Legal', 'Input', 'Documents', 'Jurisdictions', 'AI', 'Live', 'Integration'];

export default function OfflineFeatureMatrix({
  isOffline = false,
  compact = false,
  className = '',
}: OfflineFeatureMatrixProps) {
  const categories = CATEGORY_ORDER.filter(cat =>
    FEATURES.some(f => f.category === cat)
  );

  const availableCount = FEATURES.filter(f => f.offlineAvailable).length;
  const totalCount = FEATURES.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-5 h-5 text-amber-500" />
          ) : (
            <Wifi className="w-5 h-5 text-green-500" />
          )}
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Offline Feature Availability
          </h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {availableCount}/{totalCount} features offline
        </span>
      </div>

      {/* Feature List by Category */}
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {category}
          </h4>
          <div className="space-y-1">
            {FEATURES.filter(f => f.category === category).map(feature => {
              const available = feature.offlineAvailable;
              const dimmed = isOffline && !available;
              return (
                <div
                  key={feature.id}
                  className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                    dimmed
                      ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60'
                      : 'bg-white dark:bg-gray-800'
                  } border border-gray-100 dark:border-gray-700`}
                >
                  {available ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        dimmed ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {feature.name}
                      </span>
                      {isOffline && !available && (
                        <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
                          Unavailable offline
                        </span>
                      )}
                    </div>
                    {!compact && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {feature.description}
                      </p>
                    )}
                    {feature.offlineNote && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        {feature.offlineNote}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className={`p-3 rounded-lg text-sm ${
        isOffline
          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
      }`}>
        {isOffline
          ? `You're offline. ${availableCount} of ${totalCount} features remain available using cached legal data.`
          : `You're online. All ${totalCount} features are available.`
        }
      </div>
    </div>
  );
}
