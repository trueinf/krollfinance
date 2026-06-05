import React, { useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  AlertTriangle,
  Shield,
  Users,
  Sparkles,
  Copy,
  Send,
  ClipboardList,
  GitCompare,
  CheckCircle2,
  Link2,
  Merge,
  UserPlus,
  RefreshCw,
  Paperclip,
  LayoutList,
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FlowTab = 'creation' | 'maintenance';

const CREATION_STEPS = [
  { id: 1, title: 'Intake & structuring', short: 'Intake', hint: 'Email → structured request' },
  { id: 2, title: 'Validation & enrichment', short: 'Validate', hint: 'Tax, address, risk flags' },
  { id: 3, title: 'Duplicate check', short: 'Duplicates', hint: 'Core ERP fuzzy match' },
  { id: 4, title: 'Core ERP draft (HITL)', short: 'Draft', hint: 'Review & create' },
  { id: 5, title: 'Account + handoff', short: 'Done', hint: 'Account # & Credit Risk' },
];

const MAINTENANCE_STEPS = [
  { id: 1, title: 'Intake & classification', short: 'Intake', hint: 'Match customer & classify' },
  { id: 2, title: 'Proof & policy', short: 'Proof', hint: 'Evidence & rules' },
  { id: 3, title: 'Domain verification', short: 'Domain', hint: 'Email domain check' },
  { id: 4, title: 'Delta & Core ERP update', short: 'Apply', hint: 'Before / after' },
  { id: 5, title: 'Confirmation & closure', short: 'Close', hint: 'Ticket & SLA' },
];

const SAMPLE_EMAIL = `Please onboard Meridian Capital Partners (Asia) Pte Ltd for our APAC region. Attached: incorporation certificate, billing address in Singapore, and primary contacts for AP and invoicing.

We need NET30 terms as agreed with the engagement partner.

Thanks,
Client Services`;

type DuplicateChoice = 'none' | 'create' | 'link' | 'merge';

function ProgressStepper({
  steps,
  current,
  onPick,
  variant,
}: {
  steps: typeof CREATION_STEPS;
  current: number;
  onPick: (i: number) => void;
  variant: 'creation' | 'maintenance';
}) {
  const accent = variant === 'creation' ? 'navy' : 'teal';
  const activeRing =
    accent === 'navy' ? 'ring-[#00263A]/30 shadow-[#00263A]/20' : 'ring-[#7AADCB]/40 shadow-[#7AADCB]/20';
  const activeBg = accent === 'navy' ? 'bg-[#00263A]' : 'bg-[#003354]';
  const doneColor = accent === 'navy' ? 'bg-emerald-500' : 'bg-emerald-500';
  const lineDone = 'bg-emerald-400';
  const lineTodo = 'bg-slate-200';

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flow steps</span>
        <span className="text-xs font-medium tabular-nums text-slate-500">
          {current + 1}/{steps.length}
        </span>
      </div>
      <div className="flex w-full items-start gap-0">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isActive = index === current;
          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onPick(index)}
                className="group z-10 flex min-w-0 flex-1 flex-col items-center"
              >
                <div
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                    isDone && `${doneColor} text-white shadow-sm`,
                    !isDone && !isActive && 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                    isActive && `${activeBg} text-white shadow-sm ring-2 ${activeRing}`
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={clsx(
                    'mt-1 max-w-[4.5rem] text-center text-xs font-medium leading-tight',
                    isActive && 'text-[#00263A]',
                    isDone && 'text-emerald-700',
                    !isDone && !isActive && 'text-slate-400'
                  )}
                >
                  {step.short}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'mx-0.5 mt-3.5 h-px min-w-[8px] flex-1 rounded-full transition-colors',
                    index < current ? lineDone : lineTodo
                  )}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-1.5 px-1 text-center text-xs leading-snug text-slate-500">{steps[current]?.hint}</p>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-slate-200/90 bg-white p-4 text-sm leading-relaxed shadow-sm shadow-slate-200/30',
        className
      )}
    >
      {children}
    </div>
  );
}

export const CustomerMasterDataView: React.FC = () => {
  const [flow, setFlow] = useState<FlowTab>('creation');
  const [creationStep, setCreationStep] = useState(0);
  const [maintenanceStep, setMaintenanceStep] = useState(0);
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'sent' | 'approved'>('idle');
  const [appliedUpdate, setAppliedUpdate] = useState(false);
  const [duplicateChoice, setDuplicateChoice] = useState<DuplicateChoice>('none');
  const [correctionClicked, setCorrectionClicked] = useState(false);
  const [domainAction, setDomainAction] = useState<'none' | 'verify' | 'override'>('none');

  const cSteps = CREATION_STEPS;
  const mSteps = MAINTENANCE_STEPS;
  const cIdx = creationStep;
  const mIdx = maintenanceStep;

  const nextCreation = () => setCreationStep((s) => Math.min(s + 1, cSteps.length - 1));
  const prevCreation = () => setCreationStep((s) => Math.max(s - 1, 0));
  const nextMaintenance = () => setMaintenanceStep((s) => Math.min(s + 1, mSteps.length - 1));
  const prevMaintenance = () => setMaintenanceStep((s) => Math.max(s - 1, 0));

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText('CUST-APAC-2025-8047');
      toast.success('Copied to clipboard', { description: 'CUST-APAC-2025-8047' });
    } catch {
      toast.error('Could not copy');
    }
  };

  const FlowNavFooter = ({
    stepIndex,
    totalSteps,
    onPrev,
    onNext,
    onSwitchToOtherFlow,
    otherFlowLabel,
    variant,
    canGoNext = true,
  }: {
    stepIndex: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
    onSwitchToOtherFlow: () => void;
    otherFlowLabel: string;
    variant: 'creation' | 'maintenance';
    canGoNext?: boolean;
  }) => {
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;
    const primary = 'bg-[#00263A] hover:bg-[#003354] focus-visible:ring-[#00263A]';

    return (
      <div className="sticky bottom-0 z-20 mt-4 border-t border-slate-200/90 bg-slate-50/95 px-0 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-slate-500 sm:text-left">
            Step <span className="font-semibold text-slate-700">{stepIndex + 1}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalSteps}</span>
          </p>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirst}
              className={clsx(
                'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition-colors',
                isFirst
                  ? 'cursor-not-allowed border-slate-100 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {!isLast && canGoNext && (
              <button
                type="button"
                onClick={onNext}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-95 focus:outline-none focus-visible:ring-2',
                  primary
                )}
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {isLast && (
              <>
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
                  <Check className="h-4 w-4" />
                  {variant === 'creation' ? 'Account Creation Completed' : 'Flow completed'}
                </span>
                {variant === 'creation' && (
                  <button
                    type="button"
                    onClick={onSwitchToOtherFlow}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#7AADCB]/30 bg-[#7AADCB]/10 px-4 py-2 text-sm font-semibold text-[#00263A] transition-colors hover:bg-[#7AADCB]/20"
                  >
                    Move to Maintenance flow
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreationContent = () => {
    switch (cIdx) {
      case 0:
        return (
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 px-3 py-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00263A] text-white shadow-sm">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold">Incoming request</div>
                    <div className="text-xs text-slate-500">#CMD-2026-0142 · procurement@vendor.com</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 p-2.5">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">Client Services Team</span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">Today, 9:14 AM</span>
                        </div>
                        <p className="truncate text-xs text-slate-600">Subject: New customer onboarding request — Meridian Capital Partners (Asia) Pte Ltd</p>
                        <p className="text-xs text-slate-400">To: customermaster@kroll.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {SAMPLE_EMAIL}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Attachments</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['GST_Cert_ABC.pdf', 'Address_Proof.pdf'].map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 rounded border border-blue-100 bg-white px-2 py-0.5 text-xs font-medium text-blue-900"
                      >
                        <Paperclip className="h-3 w-3 opacity-70" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00263A]/10 text-[#00263A]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Customer Onboarding Request</h3>
                    <p className="text-xs text-slate-500">AI-extracted · Country / LOB rules</p>
                  </div>
                </div>
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="92, 100"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-emerald-700">92%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ['Legal name', 'Meridian Capital Partners (Asia) Pte Ltd'],
                  ['Country / market', 'Singapore · APAC'],
                  ['Tax ID (GST)', '27AABCA1234F1Z5'],
                  ['Billing address', 'Singapore, SG'],
                  ['Primary contact', 'R. Sharma'],
                  ['Currency', 'INR'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-slate-100 bg-slate-50/80 p-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</div>
                    <div className="mt-0.5 text-sm font-medium leading-tight text-slate-900">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50 p-2.5">
                <div className="flex items-start gap-1.5">
                  <LayoutList className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-700" />
                  <div>
                    <div className="text-sm font-semibold text-amber-950">Missing / unclear</div>
                    <p className="mt-0.5 text-sm text-amber-900/90">
                      Shipping address · Payment terms not specified
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs italic leading-snug text-slate-500">
                The agent converts unstructured requests into a standardized onboarding package—no manual rekeying.
              </p>
            </Card>
          </div>
        );
      case 1:
        return (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">AI Validation Summary</h3>
                <p className="text-xs text-slate-500">Tax + internal checks before ERP</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              <li className="flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                <span>Company / legal name consistent with incorporation certificate</span>
              </li>
              <li className="flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                <span>GST format valid · Verification: matched to government registry</span>
              </li>
              <li className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-950">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                <span>Address inconsistency: letterhead city vs. form billing line (optional demo twist)</span>
              </li>
            </ul>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setCorrectionClicked(true);
                  toast.success('Correction applied', { description: 'Singapore postal format standardized in draft.' });
                }}
                className={clsx(
                  'w-full rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition-all sm:w-auto',
                  correctionClicked
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300 hover:bg-blue-100'
                )}
              >
                {correctionClicked ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Applied: standardized Singapore postal format
                  </span>
                ) : (
                  'Suggested correction: use standardized Singapore postal format'
                )}
              </button>
            </div>
            <p className="mt-2 text-xs leading-snug text-slate-500">
              Validation happens before we touch ERP—so we prevent downstream billing and compliance issues.
            </p>
          </Card>
        );
      case 2:
        return (
          <div className="space-y-3">
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Potential duplicate matches</h3>
                  <p className="text-xs text-slate-500">Core ERP · Name, address, tax ID</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'ABC Industries Ltd', score: 88, reason: 'Similar name + partial address match', action: 'Review — possible duplicate' },
                  { name: 'Meridian Capital Partners (Asia) Pte Ltd', score: 42, reason: 'Different GST · different region', action: 'Likely distinct' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-600">{row.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2 py-0.5 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200">
                        {row.score}%
                      </span>
                      <span className="text-xs text-slate-500">{row.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50/90 to-white">
              <p className="text-sm font-semibold text-blue-950">AI recommendation: Create new</p>
              <p className="mt-0.5 text-xs text-blue-900/85">
                No exact tax ID match; highest fuzzy match below merge threshold. Rationale logged for audit.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'create' as const, label: 'Create new', Icon: UserPlus },
                    { id: 'link' as const, label: 'Link to existing', Icon: Link2 },
                    { id: 'merge' as const, label: 'Merge required', Icon: Merge },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setDuplicateChoice(id);
                      toast.message(`Selected: ${label}`, { description: 'Selection recorded for approval path.' });
                    }}
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all',
                      duplicateChoice === id
                        ? id === 'merge'
                          ? 'border-amber-400 bg-amber-100 text-amber-950 shadow-md'
                          : 'border-[#00263A] bg-[#00263A] text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </Card>
            <p className="text-center text-xs text-slate-500">
              This is where we avoid duplicate accounts—one of the biggest root causes of credit and collections inefficiency.
            </p>
          </div>
        );
      case 3:
        return (
          <Card>
            <h3 className="text-xs font-semibold text-slate-900">Draft Customer Record (Core ERP)</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              AR → Customers · Address book · Tax · Terms
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                { k: 'Customer group', v: 'APAC-TRD', ai: true },
                { k: 'Currency / language', v: 'INR / en-IN', ai: true },
                { k: 'Bill-to / Ship-to', v: 'Singapore (bill) · — (ship TBD)', ai: true },
                { k: 'Tax registration', v: 'GST 27AABCA1234F1Z5', ai: true },
                { k: 'Contacts & roles', v: 'AP + Invoice email', ai: true },
                { k: 'Payment terms', v: 'NET45 (pending policy)', ai: false },
              ].map((row) => (
                <div
                  key={row.k}
                  className={clsx(
                    'rounded-lg border p-2.5 transition-shadow',
                    row.ai
                      ? 'border-emerald-200/80 bg-emerald-50/40'
                      : 'border-amber-200 bg-amber-50/70 ring-1 ring-amber-100'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{row.k}</span>
                    {row.ai ? (
                      <span className="rounded bg-emerald-600/10 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                        AI
                      </span>
                    ) : (
                      <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-xs font-bold text-amber-950">
                        Confirm
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold leading-tight text-slate-900">{row.v}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                if (reviewStatus !== 'idle') return;
                setReviewStatus('sent');
                toast.message('Sent for manual review', { description: 'Waiting for reviewer approval.' });
                setTimeout(() => {
                  setReviewStatus('approved');
                  toast.success('Human approved and created in Core ERP', {
                    description: 'Draft posted after manual review.',
                  });
                }, 3500);
              }}
              disabled={reviewStatus !== 'idle'}
              className={clsx(
                'mt-3 w-full rounded-lg py-2 text-xs font-semibold text-white shadow-sm transition-all sm:w-auto sm:min-w-[160px]',
                reviewStatus === 'approved'
                  ? 'bg-emerald-600'
                  : reviewStatus === 'sent'
                    ? 'bg-amber-500'
                    : 'bg-[#00263A] hover:bg-[#003354]'
              )}
            >
              {reviewStatus === 'approved' ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> Human approved · Created in Core ERP
                </span>
              ) : reviewStatus === 'sent' ? (
                'Sent for manual review'
              ) : (
                'Send for manual review'
              )}
            </button>
            <p className="mt-2 text-xs leading-snug text-slate-500">
              The agent doesn’t just recommend—it executes with controls: review, approve, and then create.
            </p>
          </Card>
        );
      case 4:
        return (
          <div className="space-y-2.5">
            <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-2.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">Customer account created</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight text-emerald-950">CUST-APAC-2025-8047</span>
                <button
                  type="button"
                  onClick={copyAccount}
                  className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-white px-2 py-0.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <p className="mt-1 text-sm font-medium text-emerald-800">Status: Active · Core ERP sync complete</p>
            </div>
            <Card>
              <div className="mb-1.5 flex items-center gap-1.5 text-slate-900">
                <Send className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold">Auto-generated message to requester</span>
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 font-sans text-sm leading-snug text-slate-700 ring-1 ring-slate-100">
                {`Your onboarding for Meridian Capital Partners (Asia) Pte Ltd is complete. Customer account: CUST-APAC-2025-8047.`}
              </pre>
            </Card>
            <Card className="border-slate-200 bg-slate-50/30">
              <div className="flex items-center gap-1.5 text-slate-900">
                <ClipboardList className="h-4 w-4 text-violet-600" />
                <span className="text-xs font-semibold">Credit Risk — limit approval task</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Task created with customer profile, validation evidence, and risk flags for credit decisioning.
              </p>
            </Card>
            <Card className="border-blue-100 bg-blue-50/50">
              <div className="text-xs font-bold uppercase tracking-wide text-blue-900">Demo KPIs</div>
              <ul className="mt-1.5 space-y-0.5 text-sm text-blue-950">
                {[
                  '30–50% reduction in manual data entry',
                  'Higher first-time-right master data accuracy',
                  'Reduced duplicates → improved credit/collections effectiveness',
                  'Faster onboarding cycle time (hours vs days)',
                ].map((line) => (
                  <li key={line} className="flex gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-600" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
            <p className="text-center text-xs leading-tight text-slate-500">
              Downstream teams receive a clean, validated onboarding case—so credit decisions are faster.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const MaintenanceContent = () => {
    switch (mIdx) {
      case 0:
        return (
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <div className="border-b border-slate-100 bg-slate-50 px-3 py-1.5">
                <span className="text-xs font-semibold text-slate-500">Ticket #CMD-UPD-8821</span>
              </div>
              <div className="p-3">
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-2.5 font-sans text-sm leading-snug text-slate-100">
                  {`Please change the billing address for Meridian Capital Partners (Asia) Pte Ltd (CUST-APAC-2025-8047) to our new Hong Kong office. Letterhead attached.`}
                </pre>
              </div>
            </Card>
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900">Customer match</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  97% confidence
                </span>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
                  <dt className="text-slate-500">Account</dt>
                  <dd className="font-mono font-semibold text-slate-900">CUST-APAC-2025-8047</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
                  <dt className="text-slate-500">Classified</dt>
                  <dd>
                    <span className="rounded bg-[#7AADCB]/20 px-1.5 py-0.5 text-xs font-semibold text-[#00263A]">
                      Address change
                    </span>
                  </dd>
                </div>
              </dl>
              <div className="mt-2">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Core ERP snapshot</div>
                <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm text-slate-800">
                  Bill-to: Tower A, Singapore · Ship-to: same · tax registration on file
                </div>
              </div>
              <p className="mt-2 text-xs italic text-slate-500">
                First the agent finds the right record—then works with deltas, not re-entry.
              </p>
            </Card>
          </div>
        );
      case 1:
        return (
          <Card>
            <h3 className="text-xs font-semibold text-slate-900">Proof & policy</h3>
            <p className="text-xs text-slate-500">Address / name changes require evidence before update</p>
            <div className="mt-3 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <div>
                <div className="text-sm font-semibold text-emerald-950">Evidence sufficient</div>
                <p className="text-xs text-emerald-900/90">Letterhead matches legal entity on file</p>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-slate-400">•</span> PO box restriction: not triggered (street address)
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span> Address change frequency: within policy
              </li>
            </ul>
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">If proof were missing:</span> auto-response would request
              signed letterhead or registration update before any Core ERP change.
            </div>
            <p className="mt-2 text-xs text-slate-500">The agent enforces controls upfront—no proof, no change.</p>
          </Card>
        );
      case 2:
        return (
          <Card>
            <h3 className="text-xs font-semibold text-slate-900">Domain verification</h3>
            <p className="text-xs text-slate-500">Contact updates · Email domain vs company domain</p>
            <p className="mt-2 text-sm text-slate-700">
              Scenario: add contact <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">ap@abctools.com</code>{' '}
              vs company <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">@meridiancapital-asia.com</code>
            </p>
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Domain mismatch detected
              </div>
              <p className="mt-1 text-sm text-amber-950/90">
                Email domain does not match registered company domain. Public/free domains would be flagged similarly.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDomainAction('verify');
                    toast.message('Verification requested', { description: 'Templated email queued to requester.' });
                  }}
                  className={clsx(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                    domainAction === 'verify'
                      ? 'border-[#00263A] bg-[#00263A] text-white shadow-sm'
                      : 'border-amber-300 bg-white text-amber-950 hover:bg-amber-100'
                  )}
                >
                  Request additional verification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDomainAction('override');
                    toast.message('Override path', { description: 'Requires approver; logged to audit trail.' });
                  }}
                  className={clsx(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                    domainAction === 'override'
                      ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                      : 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200'
                  )}
                >
                  Override with approval
                </button>
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs text-blue-900">
                Note: This check is being overseen by a human reviewer before final action is taken.
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              This reduces fraud risk and prevents invoice delivery/contact errors.
            </p>
          </Card>
        );
      case 3:
        return (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00263A]/10 text-[#00263A]">
                <GitCompare className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Change set (before → after)</h3>
                <p className="text-xs text-slate-500">Delta + reason + proof reference</p>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-red-200/80 bg-red-50/50 p-2.5">
                <div className="text-xs font-bold uppercase text-red-800">Before</div>
                <p className="mt-1 text-sm font-medium text-slate-800">Bill-to: One Raffles Quay, Singapore 048583</p>
              </div>
              <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5">
                <div className="text-xs font-bold uppercase text-emerald-800">After</div>
                <p className="mt-1 text-sm font-medium text-slate-800">Bill-to: 8 Marina Boulevard, Hong Kong office, 999077</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Reason: customer request · Proof: letterhead_CMD.pdf
            </p>
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-xs leading-relaxed text-[#00263A]">
                Note: Bank account number and other key financial details are unchanged, and this request is only an
                address update, so it does not go to manual approval. If bank/account or other sensitive master data
                fields were changed, the request would be routed for manual review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAppliedUpdate(true);
                toast.success('Update applied in Core ERP', { description: 'Address book and audit notes updated.' });
              }}
              className={clsx(
                'mt-3 w-full rounded-lg py-2 text-xs font-semibold text-white shadow-sm transition-all sm:w-auto sm:min-w-[180px]',
                appliedUpdate ? 'bg-emerald-600' : 'bg-[#00263A] hover:bg-[#003354]'
              )}
            >
              {appliedUpdate ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> Applied in Core ERP
                </span>
              ) : (
                'Apply update in Core ERP'
              )}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              The agent executes updates as controlled transactions with full traceability.
            </p>
          </Card>
        );
      case 4:
        return (
          <div className="space-y-3">
            <Card>
              <h3 className="text-xs font-semibold text-slate-900">Closure note (auto-generated)</h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 font-sans text-sm text-slate-700 ring-1 ring-slate-100">
                {`Billing address updated for CUST-APAC-2025-8047 effective ${new Date().toLocaleDateString()}.
Invoice delivery will use Hong Kong bill-to. Ticket updated with Core ERP reference and proof link.`}
              </pre>
            </Card>
            <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-100/80 to-emerald-50 px-3 py-2 text-center shadow-sm">
              <p className="text-sm font-bold text-emerald-900">SLA achieved</p>
              <p className="text-xs text-emerald-800/90">Update completed within target window</p>
            </div>
            <Card className="border-slate-100 bg-slate-50/40">
              <div className="text-xs font-bold uppercase tracking-wider text-[#00263A]">Demo KPIs</div>
              <ul className="mt-2 space-y-1 text-sm text-[#003354]">
                {[
                  '20–35% faster turnaround on master updates',
                  'Reduced rework due to first-time-right validation',
                  'Lower invoice delivery failures due to verified contacts',
                  'Stronger audit readiness (proof + approvals + traceability)',
                ].map((line) => (
                  <li key={line} className="flex gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-cyan-600" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50"
    >
      {/* Same pattern as Promise to Pay: full-width header + scrollable main (px-8 / p-8) */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base leading-relaxed text-slate-600">
                AI structures, validates, deduplicates, and executes in Core ERP with human-in-the-loop controls—aligned with the
                same agents you see in the main dashboard.
              </p>
            </div>
          </div>
          <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setFlow('creation')}
              className={clsx(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                flow === 'creation'
                  ? 'bg-white text-[#00263A] shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <UserPlus className="h-4 w-4" />
              Creation
            </button>
            <button
              type="button"
              onClick={() => setFlow('maintenance')}
              className={clsx(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                flow === 'maintenance'
                  ? 'bg-white text-[#003354] shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Maintenance
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {flow === 'creation' && (
            <motion.div
              key="creation"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="shrink-0 border-b border-slate-200 bg-white px-8 py-4">
                <ProgressStepper steps={cSteps} current={cIdx} onPick={setCreationStep} variant="creation" />
              </div>
              <main className={clsx('min-h-0 flex-1 overflow-y-auto bg-slate-50', cIdx === 4 ? 'p-4' : 'p-5')}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-700">{cSteps[cIdx].title}</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Onboarding · Core ERP</span>
                </div>
                <CreationContent />
                <FlowNavFooter
                  stepIndex={cIdx}
                  totalSteps={cSteps.length}
                  onPrev={prevCreation}
                  onNext={nextCreation}
                  onSwitchToOtherFlow={() => setFlow('maintenance')}
                  otherFlowLabel="Go to Maintenance flow"
                  variant="creation"
                  canGoNext={cIdx !== 3 || reviewStatus === 'approved'}
                />
              </main>
            </motion.div>
          )}
          {flow === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="shrink-0 border-b border-slate-200 bg-white px-8 py-4">
                <ProgressStepper steps={mSteps} current={mIdx} onPick={setMaintenanceStep} variant="maintenance" />
              </div>
              <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-8">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-700">{mSteps[mIdx].title}</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Updates · Core ERP</span>
                </div>
                <MaintenanceContent />
                <FlowNavFooter
                  stepIndex={mIdx}
                  totalSteps={mSteps.length}
                  onPrev={prevMaintenance}
                  onNext={nextMaintenance}
                  onSwitchToOtherFlow={() => setFlow('creation')}
                  otherFlowLabel="Go to Creation flow"
                  variant="maintenance"
                  canGoNext={mIdx !== 3 || appliedUpdate}
                />
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

