"use client";

import type { FollowUpPrompt, FollowUpCategory } from "@/lib/conversation/follow-up";

const CATEGORY_LABELS: Record<FollowUpCategory, string> = {
  clarification: "Clarify",
  related: "Related",
  action: "Take Action",
  legal: "Legal Info",
};

const CATEGORY_COLORS: Record<FollowUpCategory, string> = {
  clarification: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800",
  related: "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700",
  action: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800",
  legal: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800",
};

interface FollowUpPromptsProps {
  prompts: FollowUpPrompt[];
  onSelect: (promptText: string) => void;
  className?: string;
  label?: string;
}

export function FollowUpPrompts({
  prompts,
  onSelect,
  className = "",
  label = "You might also want to know:",
}: FollowUpPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt.text)}
            title={CATEGORY_LABELS[prompt.category]}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              CATEGORY_COLORS[prompt.category]
            }`}
          >
            <span role="img" aria-hidden="true">{prompt.icon}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
