'use client';

import React from 'react';
import { Copy } from 'lucide-react';

interface CampaignRulesProps {
  rules?: string[];
  resourceLink?: string;
  editable?: boolean;
  onRuleChange?: (index: number, value: string) => void;
  onResourceChange?: (value: string) => void;
  onCopyResource?: () => void;
  resourceCopied?: boolean;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  helperText?: string;
  editing?: boolean;
  onEdit?: () => void;
  showJoinedActions?: boolean;
  onRemind?: () => void;
  onLeave?: () => void;
}

export default function CampaignRules({
  rules = [],
  resourceLink = '',
  editable = false,
  onRuleChange,
  onResourceChange,
  onCopyResource,
  resourceCopied = false,
  onSave,
  saveDisabled = true,
  saveLabel = 'Save campaign rules',
  helperText,
  editing = editable,
  onEdit,
  showJoinedActions = false,
  onRemind,
  onLeave,
}: CampaignRulesProps) {
  const visibleRules = [...rules, '', '', '', '', ''].slice(0, 5);

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign rules</h3>
      <div className="space-y-2">
        {visibleRules.map((rule, index) => editable && editing ? (
          <input
            key={`rule-${index}`}
            type="text"
            value={rule}
            onChange={(event) => onRuleChange?.(index, event.target.value)}
            placeholder={`Rule ${index + 1}`}
            maxLength={62}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        ) : rule ? (
          <div key={`rule-${index}`} className="rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-200">{rule}</div>
        ) : null)}
        <div className="border-t border-zinc-800/60 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Resource</span>
            <span className="text-[10px] text-zinc-500">Cloud storage link</span>
          </div>
          <div className="flex items-center gap-2">
            {editable && editing ? (
              <input
                type="url"
                value={resourceLink}
                onChange={(event) => onResourceChange?.(event.target.value)}
                placeholder="Paste resource link"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            ) : (
              <a href={resourceLink || '#'} target="_blank" rel="noreferrer" className="w-full truncate rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-emerald-300 hover:text-emerald-200">
                {resourceLink || 'No resource link'}
              </a>
            )}
            <button type="button" onClick={onCopyResource} disabled={!resourceLink} aria-label="Copy resource link" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {resourceCopied && <p className="mt-1 text-[10px] text-emerald-400">Resource link copied.</p>}
        </div>
        {editable && (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={onEdit} disabled={editing || saveDisabled} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">Edit rules</button>
              <button type="button" onClick={onSave} disabled={!editing || saveDisabled} className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">{saveLabel}</button>
            </div>
            {helperText && <p className="text-[10px] text-zinc-500">{helperText}</p>}
          </>
        )}
        {showJoinedActions && (
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onRemind} className="flex-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300 hover:bg-amber-500 hover:text-white">Remind</button>
            <button type="button" onClick={onLeave} className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300 hover:bg-red-500 hover:text-white">Leave</button>
          </div>
        )}
      </div>
    </div>
  );
}
