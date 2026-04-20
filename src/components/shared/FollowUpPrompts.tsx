'use client';

import React, { useState } from 'react';
import { MessageCircle, ChevronRight, X, Lightbulb } from 'lucide-react';

interface FollowUpPrompt {
  id: string;
  text: string;
  category: 'legal' | 'procedural' | 'financial' | 'rights';
  icon?: string;
}

interface FollowUpPromptsProps {
  context?: 'violation' | 'challan' | 'accident' | 'general';
  onPromptSelect: (prompt: string) => void;
  className?: string;
  maxVisible?: number;
}

const PROMPTS_BY_CONTEXT: Record<string, FollowUpPrompt[]> = {
  violation: [
    { id: 'v1', text: 'What are my rights if I disagree with this challan?', category: 'rights' },
    { id: 'v2', text: 'How do I pay this fine online?', category: 'procedural' },
    { id: 'v3', text: 'What is the appeal process for traffic violations?', category: 'procedural' },
    { id: 'v4', text: 'Can this violation affect my driving license?', category: 'legal' },
    { id: 'v5', text: 'What BNS/IPC sections apply to this offence?', category: 'legal' },
    { id: 'v6', text: 'Is there a reduced fine for early payment?', category: 'financial' },
    { id: 'v7', text: 'How do I contest a challan issued incorrectly?', category: 'procedural' },
    { id: 'v8', text: 'What documents do I need for the hearing?', category: 'procedural' },
  ],
  challan: [
    { id: 'c1', text: 'How long do I have to pay this challan?', category: 'procedural' },
    { id: 'c2', text: 'What happens if I miss the challan deadline?', category: 'legal' },
    { id: 'c3', text: 'Can I pay through the Parivahan portal?', category: 'procedural' },
    { id: 'c4', text: 'How do I check my pending challans?', category: 'procedural' },
    { id: 'c5', text: 'What is the court process for unpaid challans?', category: 'legal' },
    { id: 'c6', text: 'Can a challan be waived for first-time offenders?', category: 'financial' },
  ],
  accident: [
    { id: 'a1', text: 'What should I do immediately after an accident?', category: 'procedural' },
    { id: 'a2', text: 'How do I file an FIR for a road accident?', category: 'procedural' },
    { id: 'a3', text: 'What compensation am I entitled to under MV Act?', category: 'financial' },
    { id: 'a4', text: 'How do I claim insurance after an accident?', category: 'financial' },
    { id: 'a5', text: 'What are the liability provisions under BNS 2023?', category: 'legal' },
    { id: 'a6', text: 'Can I be held criminally liable for negligent driving?', category: 'legal' },
  ],
  general: [
    { id: 'g1', text: 'What are the speed limits in India?', category: 'legal' },
    { id: 'g2', text: 'Which documents are mandatory while driving?', category: 'legal' },
    { id: 'g3', text: 'How do I renew my driving licence?', category: 'procedural' },
    { id: 'g4', text: 'What are the rules for two-wheeler helmets?', category: 'legal' },
    { id: 'g5', text: 'How are traffic fines calculated?', category: 'financial' },
    { id: 'g6', text: 'What is the Juvenile Driving offence penalty?', category: 'legal' },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  legal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  procedural: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  financial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rights: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function FollowUpPrompts({
  context = 'general',
  onPromptSelect,
  className = '',
  maxVisible = 4,
}: FollowUpPromptsProps) {
  const [showAll, setShowAll] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const prompts = PROMPTS_BY_CONTEXT[context] || PROMPTS_BY_CONTEXT.general;
  const activePrompts = prompts.filter(p => !dismissed.includes(p.id));
  const visiblePrompts = showAll ? activePrompts : activePrompts.slice(0, maxVisible);

  if (activePrompts.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span>Suggested follow-up questions</span>
      </div>

      <div className="space-y-1.5">
        {visiblePrompts.map((prompt) => (
          <div key={prompt.id} className="flex items-start gap-2 group">
            <button
              type="button"
              onClick={() => onPromptSelect(prompt.text)}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="flex-1 text-gray-700 dark:text-gray-300">{prompt.text}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[prompt.category]}`}>
                {prompt.category}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(prev => [...prev, prompt.id])}
              className="p-2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Dismiss this suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {activePrompts.length > maxVisible && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {showAll ? 'Show fewer' : `Show ${activePrompts.length - maxVisible} more suggestions`}
        </button>
      )}
    </div>
  );
}
