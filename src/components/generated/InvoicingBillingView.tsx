import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, CheckCircle2, AlertCircle,
  FileText, Upload, ClipboardCheck, CreditCard,
  XCircle, Brain, Shield, User, Zap, ChevronRight,
  TrendingUp, FileCheck, RotateCcw, ArrowDown,
  Download, Eye, Search, Clock, Building2, Filter,
  Mail, ArrowRight, Settings, RefreshCw,
  Loader2, Sparkles, UserCheck, Database
} from 'lucide-react';
import { InvoiceDeliveryView } from './InvoiceDeliveryView';

type ProcessId = 'generation' | 'review' | 'delivery' | 'manual' | 'credit' | 'rejections' | null;

// ─── Shared sub-components ───────────────────────────────────────────────────

const FieldRow: React.FC<{ label: string; value: string; highlight?: boolean; mono?: boolean }> = ({ label, value, highlight, mono }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-xs font-semibold ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#00263A]' : 'text-slate-800'}`}>{value}</span>
  </div>
);

const CheckRow: React.FC<{ text: string; status: 'pass' | 'warn' | 'fail' }> = ({ text, status }) => (
  <div className="flex items-center gap-2 py-1.5">
    {status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
    {status === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
    {status === 'fail' && <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
    <span className="text-xs text-slate-700">{text}</span>
  </div>
);

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto p-5 custom-scrollbar ${className}`}>
    <div className="max-w-xl mx-auto space-y-4">{children}</div>
  </div>
);

const Card: React.FC<{ title: string; accent?: 'navy' | 'emerald' | 'amber' | 'rose' | 'default'; children: React.ReactNode }> = ({ title, accent = 'default', children }) => {
  const hdr = { navy: 'bg-[#00263A] border-[#001F2E]', emerald: 'bg-emerald-50 border-emerald-200', amber: 'bg-amber-50 border-amber-200', rose: 'bg-rose-50 border-rose-200', default: 'bg-slate-50 border-slate-200' }[accent];
  const lbl = { navy: 'text-[#7AADCB]', emerald: 'text-emerald-800', amber: 'text-amber-800', rose: 'text-rose-800', default: 'text-slate-500' }[accent];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className={`px-4 py-2.5 border-b ${hdr}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${lbl}`}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

const SubViewHeader: React.FC<{ title: string; badge: string; badgeColor?: 'navy' | 'amber'; onBack: () => void }> = ({ title, badge, badgeColor = 'navy', onBack }) => (
  <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
      <ArrowLeft className="w-3.5 h-3.5" />
      Back to Billing Execution
    </button>
    <div className="w-px h-4 bg-slate-200" />
    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
    <span className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full ${badgeColor === 'amber' ? 'bg-amber-50 border border-amber-200' : 'bg-[#00263A]'}`}>
      <Zap className={`w-2.5 h-2.5 ${badgeColor === 'amber' ? 'text-amber-600' : 'text-[#7AADCB]'}`} />
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${badgeColor === 'amber' ? 'text-amber-700' : 'text-[#7AADCB]'}`}>{badge}</span>
    </span>
  </div>
);

// ─── Invoice Generation ───────────────────────────────────────────────────────

// ─── Invoice Generation Data ──────────────────────────────────────────────────

type InvStatus = 'generated' | 'pending' | 'approved';

interface GeneratedInvoice {
  id: string;
  client: string;
  clientAddr: string;
  matter: string;
  service: string;
  amount: string;
  subtotal: string;
  tax: string;
  taxRate: string;
  type: string;
  period: string;
  date: string;
  due: string;
  entity: string;
  status: InvStatus;
  partner: string;
  lines: { desc: string; hours: string; rate: string; total: string }[];
  demoProcess?: ProcessId;
  demoButtonText?: string;
}

const GENERATED_INVOICES: GeneratedInvoice[] = [
  {
    id: 'KRL-INV-4821', client: 'Pinnacle Capital Partners LLC', clientAddr: '3000 Sand Hill Road, Menlo Park, CA 94025',
    matter: 'KRL-MAT-2025-0847', service: 'Valuation Advisory', amount: '$95,000.00',
    subtotal: '$85,000.00', tax: '$10,000.00', taxRate: '11.76%',
    type: 'T&M', period: 'Feb 2026', date: '28 Feb 2026', due: '30 Mar 2026',
    entity: 'KRL-US', status: 'pending', partner: 'Michael Thornton',
    lines: [
      { desc: 'Director — Portfolio Valuation', hours: '50.0h', rate: '$650/h', total: '$32,500.00' },
      { desc: 'Associate — Financial Modelling', hours: '140.0h', rate: '$375/h', total: '$52,500.00' },
    ],
    demoProcess: 'review', demoButtonText: 'Proceed to Review & Approval',
  },
  {
    id: 'KRL-INV-2026-4932', client: 'Aldridge Pharma Group', clientAddr: '245 Park Avenue, New York, NY 10167',
    matter: 'KRL-MAT-2025-0091', service: 'Valuation Advisory', amount: '$83,137.00',
    subtotal: '$78,925.00', tax: '$4,212.00', taxRate: '8.875%',
    type: 'T&M', period: 'Feb 2026', date: '28 Feb 2026', due: '30 Mar 2026',
    entity: 'KRL-US', status: 'generated', partner: 'Michael Thornton',
    lines: [
      { desc: 'Partner — Valuation Advisory', hours: '18.0h', rate: '$950/h', total: '$17,100.00' },
      { desc: 'Director — Valuation Advisory', hours: '42.5h', rate: '$650/h', total: '$27,625.00' },
      { desc: 'Associate — Valuation Advisory', hours: '80.0h', rate: '$375/h', total: '$30,000.00' },
      { desc: 'Disbursements & Expenses', hours: '—', rate: '—', total: '$4,200.00' },
    ],
    demoProcess: 'credit', demoButtonText: 'Proceed to Credit / Rebill Case',
  },
  {
    id: 'KRL-INV-2026-4935', client: 'Sterling Trust Bank', clientAddr: '10 Exchange Square, London EC2A 2BR',
    matter: 'KRL-MAT-2025-0156', service: 'Restructuring Advisory', amount: '$45,200.00',
    subtotal: '$45,200.00', tax: '$0.00', taxRate: '0% (EU exempt)',
    type: 'Fixed Fee', period: 'Feb 2026', date: '28 Feb 2026', due: '30 Mar 2026',
    entity: 'KRL-EU', status: 'generated', partner: 'Rachel Ford',
    lines: [
      { desc: 'Restructuring Advisory — Phase 1 Completion', hours: '—', rate: '—', total: '$40,000.00' },
      { desc: 'Financial Modelling — Scenario Analysis', hours: '—', rate: '—', total: '$5,200.00' },
    ],
    demoProcess: 'manual', demoButtonText: 'Proceed to Manual Billing Case',
  },
  {
    id: 'KRL-INV-2026-4941', client: 'Meridian Capital Partners', clientAddr: '200 Clarendon St, Boston, MA 02116',
    matter: 'KRL-MAT-2025-0143', service: 'Transaction Advisory', amount: '$78,900.00',
    subtotal: '$72,500.00', tax: '$6,400.00', taxRate: '8.875%',
    type: 'Fixed Fee', period: 'Feb 2026', date: '26 Feb 2026', due: '28 Mar 2026',
    entity: 'KRL-US', status: 'approved', partner: 'Sarah Chen',
    lines: [
      { desc: 'Transaction Advisory — M&A Due Diligence', hours: '—', rate: '—', total: '$55,000.00' },
      { desc: 'Financial Due Diligence — Report', hours: '—', rate: '—', total: '$17,500.00' },
    ],
  },
  {
    id: 'KRL-INV-2026-4944', client: 'Pinnacle Global', clientAddr: '55 Baker Street, London W1U 7EU',
    matter: 'KRL-MAT-2025-0207', service: 'Forensic Accounting', amount: '$95,000.00',
    subtotal: '$95,000.00', tax: '$0.00', taxRate: '0% (EU exempt)',
    type: 'Milestone', period: 'Feb 2026', date: '25 Feb 2026', due: '27 Mar 2026',
    entity: 'KRL-EU', status: 'generated', partner: 'David Park',
    lines: [
      { desc: 'Forensic Investigation — Phase 2 Milestone', hours: '—', rate: '—', total: '$75,000.00' },
      { desc: 'Expert Report — Final Deliverable', hours: '—', rate: '—', total: '$20,000.00' },
    ],
  },
];

const STATUS_CONFIG: Record<InvStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  generated: { label: 'Generated', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  approved:  { label: 'Approved',  dot: 'bg-[#00263A]',  text: 'text-[#00263A]',  bg: 'bg-[#E8F0F5]', border: 'border-[#C5DAE8]' },
  pending:   { label: 'Generating…', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};

// ─── Invoice Generation — Inbox ───────────────────────────────────────────────

const InvoiceInbox: React.FC<{
  onBack: () => void;
  onOpen: (inv: GeneratedInvoice) => void;
  invoices: GeneratedInvoice[];
}> = ({ onBack, onOpen, invoices }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InvStatus | 'all'>('all');

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = q === '' || inv.client.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q) || inv.service.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
      <SubViewHeader title="Invoice Generation" badge="AI-Automated" onBack={onBack} />

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-8 shrink-0">
        {[
          { label: 'Generated', count: invoices.filter(i => i.status === 'generated').length, color: 'text-emerald-600' },
          { label: 'Approved', count: invoices.filter(i => i.status === 'approved').length, color: 'text-[#00263A]' },
          { label: 'Generating', count: invoices.filter(i => i.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Total This Month', count: invoices.length, color: 'text-slate-800' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`text-base font-semibold ${s.color}`}>{s.count}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-[#00263A]" />
          <span className="text-[10px] text-slate-500">AI-generated from Core ERP contracts, SOWs & rate cards</span>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search client, invoice or service…"
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none" />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'generated', 'approved', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-colors ${filter === f ? 'bg-[#00263A] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[10px] text-slate-400">{filtered.length} invoices</div>
      </div>

      {/* Invoice table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Invoice</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Service</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Period</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Due</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map(inv => {
              const s = STATUS_CONFIG[inv.status];
              return (
                <tr key={inv.id} className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onOpen(inv)}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-[#00263A]">{inv.id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-semibold text-slate-800">{inv.client}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.matter}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{inv.service}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{inv.type}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{inv.period}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 text-right">{inv.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`flex items-center gap-1.5 w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{inv.due}</td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#00263A] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ─── Invoice Generation — Detail view ────────────────────────────────────────

// ─── Animated right panel for "Generating…" invoices ────────────────────────

type GenPhase = 'idle' | 'validating' | 'generating' | 'complete';

const InvoiceGeneratingPanel: React.FC<{ inv: GeneratedInvoice; onComplete: () => void }> = ({ inv, onComplete }) => {
  const [phase, setPhase] = useState<GenPhase>('idle');
  const [checksDone, setChecksDone] = useState(0);
  const [activeCheck, setActiveCheck] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [genStepsDone, setGenStepsDone] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledComplete = useRef(false);

  const CHECKS = [
    `Contract confirmed active — ${inv.matter}`,
    'Rate card version v2.4 matched — effective 1 Jan 2026',
    `Billing entity verified — ${inv.entity}, EIN confirmed`,
    `Tax jurisdiction identified — ${inv.taxRate} applicable`,
    `Engagement partner sign-off — ${inv.partner}`,
    'SOW milestone status — phase complete',
    'Duplicate check — no prior invoice this period',
  ];

  const GEN_STEPS = [
    'Building line items from rate card…',
    'Calculating tax & totals…',
    'Formatting invoice document…',
    'Creating Core ERP billing record…',
  ];

  const startValidation = () => {
    setPhase('validating');
    const timers: ReturnType<typeof setTimeout>[] = [];

    CHECKS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveCheck(i), i * 700));
      timers.push(setTimeout(() => { setActiveCheck(-1); setChecksDone(i + 1); }, i * 700 + 450));
    });

    const allDone = CHECKS.length * 700 + 450;
    timers.push(setTimeout(() => setPhase('generating'), allDone + 300));

    GEN_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setGenStepsDone(i + 1), allDone + 500 + i * 500));
    });

    timers.push(setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 100;
          }
          return p + 4;
        });
      }, 60);
    }, allDone + 400));

    const completeAt = allDone + 500 + GEN_STEPS.length * 500 + 600;
    timers.push(setTimeout(() => {
      setPhase('complete');
      if (!calledComplete.current) {
        calledComplete.current = true;
        onComplete();
      }
    }, completeAt));

    return () => {
      timers.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  };

  // ── Idle — waiting for user to trigger ──
  if (phase === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm px-6">
          <div className="w-16 h-16 mx-auto mb-5 bg-[#E8F0F5] rounded-2xl flex items-center justify-center shadow-sm">
            <Brain className="w-8 h-8 text-[#00263A]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Ready to Validate & Generate</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            The AI agent will validate billing data against Core ERP contracts, rate cards and compliance rules before generating the invoice.
          </p>
          <div className="flex flex-col gap-2 items-center mb-5 text-left max-w-xs mx-auto">
            {['7 automated validation checks', 'Rate card & contract matching', 'Tax jurisdiction & entity verification', 'Duplicate invoice detection'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 w-full">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
                <span className="text-xs text-slate-500">{item}</span>
              </div>
            ))}
          </div>
          <button onClick={startValidation}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors mx-auto shadow-lg hover:shadow-xl active:scale-95">
            <Zap className="w-4 h-4" />
            Run AI Validation
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Complete — show invoice ──
  if (phase === 'complete') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-800">Invoice generated successfully — all 7 validation checks passed · Status updated to Generated</span>
          </div>
          <InvoiceDocument inv={inv} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex flex-col">
      <div className="max-w-xl mx-auto w-full space-y-4">

        {/* Phase indicator */}
        <div className="flex items-center gap-3">
          {(['validating', 'generating'] as GenPhase[]).map((p, i) => {
            const done = phase === 'generating' && p === 'validating';
            const active = phase === p;
            return (
              <React.Fragment key={p}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500' : active ? 'bg-[#00263A]' : 'bg-slate-200'}`}>
                    {done ? <Check className="w-3 h-3 text-white" /> : <span className="text-[9px] font-bold text-white">{i + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-[#00263A]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {p === 'validating' ? 'AI Validation' : 'Invoice Generation'}
                  </span>
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Validation checks */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <motion.div animate={{ rotate: phase === 'validating' ? 360 : 0 }} transition={{ duration: 1.2, repeat: phase === 'validating' ? Infinity : 0, ease: 'linear' }}>
              <Brain className={`w-4 h-4 ${phase === 'generating' ? 'text-emerald-600' : 'text-[#00263A]'}`} />
            </motion.div>
            <span className="text-sm font-semibold text-slate-800">AI Validation Agent</span>
            <span className="ml-auto text-[10px] text-slate-400">{Math.min(checksDone, CHECKS.length)}/{CHECKS.length} checks</span>
          </div>
          <div className="p-4 space-y-2">
            {CHECKS.map((check, i) => {
              const done = i < checksDone;
              const running = activeCheck === i;
              const pending = !done && !running;
              return (
                <AnimatePresence key={i}>
                  {(done || running || i <= checksDone) && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: pending ? 0.35 : 1, y: 0 }}
                      className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-emerald-100' : running ? 'bg-amber-100' : 'bg-slate-100'}`}>
                        {done && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                        {running && (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>
                            <div className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                          </motion.div>
                        )}
                        {pending && <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                      </div>
                      <span className={`text-xs transition-colors ${done ? 'text-slate-700' : running ? 'text-amber-700 font-medium' : 'text-slate-400'}`}>
                        {check}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
          {phase !== 'validating' && (
            <div className="px-5 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-800">All {CHECKS.length} checks passed · Proceeding to invoice generation</span>
            </div>
          )}
        </div>

        {/* Generation phase */}
        <AnimatePresence>
          {phase === 'generating' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <FileText className="w-4 h-4 text-[#00263A]" />
                </motion.div>
                <span className="text-sm font-semibold text-slate-800">Generating Invoice</span>
                <span className="ml-auto text-[10px] font-semibold text-[#00263A]">{progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="px-5 pt-4 pb-2">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#00263A] rounded-full" style={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
                </div>
              </div>

              {/* Sub-steps */}
              <div className="p-4 space-y-2">
                {GEN_STEPS.map((step, i) => {
                  const done = i < genStepsDone;
                  const running = i === genStepsDone - 1 && progress < 100;
                  return (
                    <AnimatePresence key={i}>
                      {i < genStepsDone && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done && !running ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {done && !running
                              ? <Check className="w-2.5 h-2.5 text-emerald-600" />
                              : (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>
                                  <div className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                                </motion.div>
                              )
                            }
                          </div>
                          <span className={`text-xs ${done && !running ? 'text-slate-700' : 'text-amber-700 font-medium'}`}>{step}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Invoice {inv.id} · Kroll Invoice AI Agent · Core ERP {inv.entity}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Shared invoice document sub-component ────────────────────────────────────

const InvoiceDocument: React.FC<{ inv: GeneratedInvoice }> = ({ inv }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="bg-[#00263A] px-8 py-6 flex items-start justify-between">
      <div>
        <div className="text-white text-lg font-bold tracking-tight mb-0.5">Kroll</div>
        <div className="text-[#7AADCB] text-xs">Receivables Intelligence</div>
      </div>
      <div className="text-right">
        <div className="text-[#7AADCB] text-[10px] font-semibold uppercase tracking-widest mb-1">Invoice</div>
        <div className="text-white font-mono text-sm font-semibold">{inv.id}</div>
        <div className="text-[#7AADCB] text-xs mt-1">Issued: {inv.date}</div>
      </div>
    </div>
    <div className="px-8 py-5 grid grid-cols-3 gap-6 border-b border-slate-100">
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">From</div>
        <div className="text-xs font-semibold text-slate-800">Kroll Inc.</div>
        <div className="text-xs text-slate-500 leading-relaxed mt-0.5">55 East 52nd Street<br />New York, NY 10055<br />EIN: 13-3523498</div>
        <div className="text-xs text-slate-500 mt-1">Entity: {inv.entity}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</div>
        <div className="text-xs font-semibold text-slate-800">{inv.client}</div>
        <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{inv.clientAddr}</div>
        <div className="text-xs text-slate-500 mt-1">Matter: <span className="font-mono">{inv.matter}</span></div>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Details</div>
        <div className="space-y-1">
          {[['Due Date', inv.due], ['Terms', 'Net 30'], ['Currency', 'USD'], ['Method', 'Wire / ACH']].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs"><span className="text-slate-500">{l}</span><span className="font-semibold text-slate-800">{v}</span></div>
          ))}
        </div>
      </div>
    </div>
    <div className="px-8 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-8">
      {[['Service', inv.service], ['Period', inv.period], ['Type', inv.type], ['Partner', inv.partner]].map(([l, v]) => (
        <div key={l}><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{l}</span><div className="text-xs font-semibold text-slate-800 mt-0.5">{v}</div></div>
      ))}
    </div>
    <div className="px-8 py-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200">
            {['Description', 'Hours', 'Rate', 'Amount'].map((h, i) => (
              <th key={h} className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 ${i === 0 ? 'text-left w-1/2' : 'text-right'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {inv.lines.map((l, i) => (
            <tr key={i}>
              <td className="py-2.5 text-slate-700">{l.desc}</td>
              <td className="py-2.5 text-right text-slate-500">{l.hours}</td>
              <td className="py-2.5 text-right text-slate-500">{l.rate}</td>
              <td className="py-2.5 text-right font-semibold text-slate-800">{l.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="px-8 pb-5 flex justify-end">
      <div className="w-56 space-y-1.5">
        <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-800">{inv.subtotal}</span></div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Tax ({inv.taxRate})</span><span className="font-semibold text-slate-800">{inv.tax}</span></div>
        <div className="flex justify-between pt-2 border-t border-slate-200">
          <span className="text-sm font-bold text-slate-800">Total Due</span>
          <span className="text-sm font-bold text-[#00263A]">{inv.amount}</span>
        </div>
      </div>
    </div>
    <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
      <div className="text-[10px] text-slate-400">Questions? <span className="font-semibold text-slate-600">ar@kroll.com</span> · +1 212 450 8400</div>
      <div className="flex items-center gap-1.5">
        <Brain className="w-3 h-3 text-[#00263A]" />
        <span className="text-[10px] text-slate-400">Kroll Invoice AI · Audit ref: KRL-AUD-{inv.id.slice(-4)}</span>
      </div>
    </div>
  </div>
);

// ─── Invoice Detail ───────────────────────────────────────────────────────────

const InvoiceDetail: React.FC<{
  inv: GeneratedInvoice;
  onBack: () => void;
  onGenerationComplete: () => void;
  onProceed: (process: ProcessId) => void;
}> = ({ inv, onBack, onGenerationComplete, onProceed }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(inv.status);
  const sc = STATUS_CONFIG[currentStatus];

  const handleComplete = () => {
    setCurrentStatus('generated');
    onGenerationComplete();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Inbox
        </button>
        <div className="w-px h-4 bg-slate-200" />
        <span className="font-mono text-xs font-semibold text-[#00263A]">{inv.id}</span>
        <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {currentStatus !== 'pending' && <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Eye className="w-3.5 h-3.5" />View
            </button>
            <button onClick={() => setDownloaded(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${downloaded ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
              {downloaded ? <><Check className="w-3.5 h-3.5" />Downloaded</> : <><Download className="w-3.5 h-3.5" />Download PDF</>}
            </button>
            {currentStatus === 'generated' && (
              <button onClick={() => onProceed(inv.demoProcess || 'review')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors shadow-sm">
                {inv.demoButtonText || 'Proceed to Review & Approval'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </>}
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">

        {/* LEFT — Source + Line Items + AI Checks */}
        <div className="w-[420px] flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-white">
          <div className="p-5 space-y-4">

            {/* Source */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#00263A]" />
                <span className="text-sm font-semibold text-slate-800">Billing Source — Kroll Core ERP</span>
              </div>
              <Card title="Engagement Details">
                <FieldRow label="Client" value={inv.client} highlight />
                <FieldRow label="Matter Code" value={inv.matter} mono highlight />
                <FieldRow label="Service Line" value={inv.service} />
                <FieldRow label="Billing Type" value={inv.type} />
                <FieldRow label="Billing Period" value={`1 ${inv.period.split(' ')[0]} – ${inv.period}`} />
                <FieldRow label="Billing Entity" value={inv.entity} />
                <FieldRow label="Engagement Partner" value={inv.partner} />
              </Card>
            </div>

            {/* Line Items */}
            <Card title="Line Items from Rate Card">
              <div className="space-y-0">
                <div className="flex text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 mb-1">
                  <span className="flex-1">Description</span>
                  <span className="w-12 text-right">Hours</span>
                  <span className="w-16 text-right">Rate</span>
                  <span className="w-20 text-right">Amount</span>
                </div>
                {inv.lines.map((l, i) => (
                  <div key={i} className="flex items-center py-1.5 border-b border-slate-50 last:border-0 text-xs gap-2">
                    <span className="flex-1 text-slate-700">{l.desc}</span>
                    <span className="w-12 text-right text-slate-400">{l.hours}</span>
                    <span className="w-16 text-right text-slate-400">{l.rate}</span>
                    <span className="w-20 text-right font-semibold text-slate-800">{l.total}</span>
                  </div>
                ))}
                <div className="pt-2 mt-1 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-800">{inv.subtotal}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Tax ({inv.taxRate})</span><span className="font-semibold text-slate-800">{inv.tax}</span></div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                    <span className="text-slate-800">Total</span>
                    <span className="text-[#00263A]">{inv.amount}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Checks — only shown after validation completes */}
            {currentStatus !== 'pending' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card title="AI Validation Checks" accent="emerald">
                  <div className="space-y-0.5">
                    <CheckRow status="pass" text={`Contract confirmed active — ${inv.matter}`} />
                    <CheckRow status="pass" text="Rate card version v2.4 applied — effective 1 Jan 2026" />
                    <CheckRow status="pass" text={`Billing entity verified — ${inv.entity}, EIN confirmed`} />
                    <CheckRow status="pass" text={`Tax jurisdiction identified — ${inv.taxRate} applied`} />
                    <CheckRow status="pass" text={`Partner sign-off recorded — ${inv.partner}`} />
                    <CheckRow status="pass" text="SOW milestone status checked — phase complete" />
                    <CheckRow status="pass" text="Duplicate invoice check passed — no prior invoice this period" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-800">7 / 7 checks passed · Ready for approval</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT — Generating animation or Invoice Document */}
        {inv.status === 'pending' ? (
          <InvoiceGeneratingPanel inv={inv} onComplete={handleComplete} />
        ) : (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Brain className="w-3 h-3 text-[#00263A]" />
              Generated Invoice — AI Output
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

              {/* Header */}
              <div className="bg-[#00263A] px-8 py-6 flex items-start justify-between">
                <div>
                  <div className="text-white text-lg font-bold tracking-tight mb-0.5">Kroll</div>
                  <div className="text-[#7AADCB] text-xs">Receivables Intelligence</div>
                </div>
                <div className="text-right">
                  <div className="text-[#7AADCB] text-[10px] font-semibold uppercase tracking-widest mb-1">Invoice</div>
                  <div className="text-white font-mono text-sm font-semibold">{inv.id}</div>
                  <div className="text-[#7AADCB] text-xs mt-1">Issued: {inv.date}</div>
                </div>
              </div>

              {/* From / Bill To / Payment */}
              <div className="px-8 py-5 grid grid-cols-3 gap-6 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">From</div>
                  <div className="text-xs font-semibold text-slate-800">Kroll Inc.</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">55 East 52nd Street<br />New York, NY 10055<br />EIN: 13-3523498</div>
                  <div className="text-xs text-slate-500 mt-1">Entity: {inv.entity}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</div>
                  <div className="text-xs font-semibold text-slate-800">{inv.client}</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{inv.clientAddr}</div>
                  <div className="text-xs text-slate-500 mt-1">Matter: <span className="font-mono">{inv.matter}</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Details</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Due Date</span><span className="font-semibold text-slate-800">{inv.due}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Terms</span><span className="font-semibold text-slate-800">Net 30</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Currency</span><span className="font-semibold text-slate-800">USD</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Method</span><span className="font-semibold text-slate-800">Wire / ACH</span></div>
                  </div>
                </div>
              </div>

              {/* Service strip */}
              <div className="px-8 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-8">
                <div><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Service</span><div className="text-xs font-semibold text-slate-800 mt-0.5">{inv.service}</div></div>
                <div><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Period</span><div className="text-xs font-semibold text-slate-800 mt-0.5">{inv.period}</div></div>
                <div><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</span><div className="text-xs font-semibold text-slate-800 mt-0.5">{inv.type}</div></div>
                <div><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Partner</span><div className="text-xs font-semibold text-slate-800 mt-0.5">{inv.partner}</div></div>
              </div>

              {/* Line items */}
              <div className="px-8 py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 w-1/2">Description</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2">Hours</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2">Rate</th>
                      <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {inv.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-slate-700">{l.desc}</td>
                        <td className="py-2.5 text-right text-slate-500">{l.hours}</td>
                        <td className="py-2.5 text-right text-slate-500">{l.rate}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800">{l.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 pb-5 flex justify-end">
                <div className="w-56 space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-800">{inv.subtotal}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Tax ({inv.taxRate})</span><span className="font-semibold text-slate-800">{inv.tax}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-800">Total Due</span>
                    <span className="text-sm font-bold text-[#00263A]">{inv.amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  Questions? <span className="font-semibold text-slate-600">ar@kroll.com</span> · +1 212 450 8400
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-[#00263A]" />
                  <span className="text-[10px] text-slate-400">Kroll Invoice AI · Audit ref: KRL-AUD-{inv.id.slice(-4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Invoice Generation — Root (manages inbox ↔ detail) ──────────────────────

const InvoiceGenerationView: React.FC<{
  onBack: () => void;
  invoices: GeneratedInvoice[];
  onUpdateInvoice: (id: string, status: InvStatus) => void;
  onProceed: (process: ProcessId) => void;
}> = ({ onBack, invoices, onUpdateInvoice, onProceed }) => {
  const inv = invoices[0]; // Go directly to the workflow for the first invoice

  return (
    <AnimatePresence mode="wait">
      <InvoiceDetail
        key={inv.id}
        inv={inv}
        onBack={onBack}
        onGenerationComplete={() => onUpdateInvoice(inv.id, 'generated')}
        onProceed={onProceed}
      />
    </AnimatePresence>
  );
};

// ─── Invoice Review & Approval ────────────────────────────────────────────────

const REVIEW_CHECKS = [
  'Pricing verified — all rates match approved rate card v2.4',
  'Contract compliance — SOW Phase 2 milestones met',
  'Tax treatment correct — NY State 8.875% applied',
  'Completeness check — all required fields populated',
  'Customer details verified — billing address confirmed in Core ERP',
  'Duplicate check — no prior invoice for this period',
];

const InvoiceReviewApprovalView: React.FC<{ onBack: () => void; fromGeneration?: boolean; onGoToDelivery?: () => void }> = ({ onBack, fromGeneration, onGoToDelivery }) => {
  const [checksDone, setChecksDone] = useState(0);
  const [activeCheck, setActiveCheck] = useState(-1);
  const [checksComplete, setChecksComplete] = useState(!fromGeneration); // if coming from hub, show static
  const [approvedStages, setApprovedStages] = useState<number[]>([0]);

  useEffect(() => {
    if (!fromGeneration) return; // don't animate if opened from hub directly
    const timers: ReturnType<typeof setTimeout>[] = [];
    REVIEW_CHECKS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveCheck(i), i * 650));
      timers.push(setTimeout(() => { setActiveCheck(-1); setChecksDone(i + 1); }, i * 650 + 420));
    });
    timers.push(setTimeout(() => setChecksComplete(true), REVIEW_CHECKS.length * 650 + 420));
    return () => timers.forEach(clearTimeout);
  }, [fromGeneration]);

  const stages = [
    { role: 'Engagement Manager', name: 'Michael Thornton', approved: true, time: '28 Feb, 09:14' },
    { role: 'Billing Controller', name: 'Sarah Chen', approved: approvedStages.includes(1), time: approvedStages.includes(1) ? '28 Feb, 10:42' : 'Awaiting' },
    { role: 'Finance Director', name: 'James Whitfield', approved: approvedStages.includes(2), time: approvedStages.includes(2) ? '28 Feb, 11:55' : 'Awaiting' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
      <SubViewHeader title="Invoice Review & Approval" badge="AI-Assisted" badgeColor="amber" onBack={onBack} />
      <div className="flex-1 flex flex-row overflow-hidden">

        {/* LEFT — Pre-Bill Validation */}
        <Panel className="border-r border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-[#00263A]" />
            <span className="text-sm font-semibold text-slate-800">Pre-Bill Validation</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">AI validates the invoice before it enters the approval workflow</p>

          <Card title="Invoice Under Review">
            <FieldRow label="Invoice" value="KRL-INV-4821" mono highlight />
            <FieldRow label="Client" value="Pinnacle Capital Partners LLC" />
            <FieldRow label="Amount" value="$95,000.00" highlight />
            <FieldRow label="Matter" value="KRL-MAT-2025-0847" mono />
            <FieldRow label="Service" value="Valuation Advisory" />
            <FieldRow label="Period" value="Feb 2026" />
          </Card>

          {/* Animated checks */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className={`px-4 py-2.5 border-b ${checksComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                {checksComplete
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  : <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Brain className="w-3.5 h-3.5 text-[#00263A]" />
                    </motion.div>
                }
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${checksComplete ? 'text-emerald-800' : 'text-slate-500'}`}>
                  {checksComplete ? 'AI Pre-Bill Validation — Complete' : 'AI Pre-Bill Validation — Running…'}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">{Math.min(checksDone, REVIEW_CHECKS.length)}/{REVIEW_CHECKS.length}</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {REVIEW_CHECKS.map((check, i) => {
                const done = i < checksDone;
                const running = activeCheck === i;
                if (!done && !running && i > checksDone) return null;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100' : running ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      {done && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                      {running && (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
                          <div className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-xs ${done ? 'text-slate-700' : running ? 'text-amber-700 font-medium' : 'text-slate-400'}`}>{check}</span>
                  </motion.div>
                );
              })}
            </div>
            {checksComplete && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-800">6 / 6 checks passed · No exceptions · Approval workflow unlocked</span>
              </motion.div>
            )}
          </div>
        </Panel>

        {/* RIGHT — Approval Workflow */}
        <Panel className="bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#00263A]" />
            <span className="text-sm font-semibold text-slate-800">Approval Workflow</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Customer-defined gates — all approvals documented before release</p>

          {/* Locked state before checks complete */}
          {!checksComplete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-300 rounded-xl bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Approval Locked</p>
              <p className="text-[10px] text-slate-400">Waiting for AI pre-bill validation to complete before approval gates open.</p>
            </motion.div>
          )}

          {/* Approval chain — unlocks after checks */}
          {checksComplete && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card title="Approval Chain">
                <div className="space-y-3">
                  {stages.map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${s.approved ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${s.approved ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        {s.approved ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="text-[10px] text-white font-bold">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.role}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] font-semibold uppercase tracking-wider ${s.approved ? 'text-emerald-700' : 'text-slate-400'}`}>{s.approved ? 'Approved' : 'Pending'}</div>
                        <div className="text-[10px] text-slate-400">{s.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {approvedStages.length < 3 && (
                <button onClick={() => setApprovedStages(p => p.includes(1) ? [...p, 2] : [...p, 1])}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  {approvedStages.length === 1 ? 'Billing Controller — Approve' : 'Finance Director — Final Approve'}
                </button>
              )}

              <Card title="Audit Trail" accent={approvedStages.length === 3 ? 'emerald' : 'default'}>
                <FieldRow label="Approval SLA" value="24 hours" />
                <FieldRow label="Elapsed" value="2h 41m" />
                <FieldRow label="SLA Status" value="On Track" highlight />
                <FieldRow label="Approvals" value={`${approvedStages.length} / 3`} highlight={approvedStages.length === 3} />
                <FieldRow label="Audit Ref" value="KRL-AUD-4821" mono />
              </Card>

              {approvedStages.length === 3 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#00263A] rounded-lg p-4 text-white mt-4">
                  <div className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider mb-1">All Approvals Complete</div>
                  <p className="text-xs text-white/80 mb-3">Invoice KRL-INV-4821 approved · Queued for issuance via client portal.</p>
                  {onGoToDelivery && (
                    <button onClick={onGoToDelivery} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#7AADCB] text-[#00263A] rounded-lg text-xs font-bold hover:bg-white transition-colors">
                      Move to Invoice Issuance & Delivery
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </Panel>
      </div>
    </motion.div>
  );
};

// ─── Manual Billing ───────────────────────────────────────────────────────────

const ManualBillingView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      const timers = [
        setTimeout(() => setCurrentStep(1), 1500),
        setTimeout(() => setCurrentStep(2), 3500),
        setTimeout(() => setCurrentStep(3), 5500),
        setTimeout(() => setStatus('done'), 7500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [status]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
      <SubViewHeader title="Manual Billing Request" badge="AI-Assisted Workflow" badgeColor="amber" onBack={onBack} />
      <div className="flex-1 flex flex-row overflow-hidden">
        <Panel className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#00263A]" />
            <span className="text-sm font-semibold text-slate-800">Source Request & Evidence</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Exception-based billing for non-standard or one-time scenarios</p>
          <Card title="Request Details">
            <FieldRow label="Request Type" value="One-Time Charge" highlight />
            <FieldRow label="Client" value="Meridian Capital Partners" />
            <FieldRow label="Matter" value="KRL-MAT-2025-0143" mono />
            <FieldRow label="Description" value="Expert witness fee - deposition 18 Feb 2026" />
            <FieldRow label="Amount" value="$15,000.00" highlight />
            <FieldRow label="Requested by" value="Rachel Ford, Engagement Dir." />
          </Card>
          <Card title="Supporting Documentation">
            {[
              { file: 'Expert_Witness_Fee_Agreement.pdf', type: 'Contract' },
              { file: 'Deposition_Confirmation_18Feb.pdf', type: 'Evidence' },
              { file: 'Partner_Approval_Email.pdf', type: 'Approval' },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-700 font-medium truncate">{doc.file}</div>
                    <div className="text-[10px] text-slate-400">{doc.type}</div>
                  </div>
                </div>
                <button className="text-[10px] font-semibold text-[#00263A] hover:underline">View</button>
              </div>
            ))}
          </Card>
        </Panel>
        
        {/* Right Panel: AI Processing Workflow */}
        <Panel className="w-1/2 bg-slate-50 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mt-6">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#00263A]" />
                  <span className="text-sm font-semibold text-slate-800">AI Processing Workflow</span>
                </div>
                {status === 'processing' && <Loader2 className="w-3.5 h-3.5 text-[#00263A] animate-spin" />}
                {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="p-4 space-y-4">
                {status === 'idle' ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-[#E8F0F5] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-5 h-5 text-[#00263A]" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Ready to Process</h3>
                    <p className="text-xs text-slate-500 mb-6 px-4">AI will extract terms, validate approvals, and generate the draft invoice.</p>
                    <button onClick={() => setStatus('processing')} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#00263A] text-white rounded-lg text-xs font-bold hover:bg-[#003354] transition-colors mx-auto w-full">
                      <Brain className="w-3.5 h-3.5" />
                      Begin AI Analysis
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {[
                      { title: 'Document Extraction', desc: 'Analyzed 3 files. Found $15,000 match in Fee Agreement.', icon: FileText, done: currentStep >= 1 },
                      { title: 'Approval Validation', desc: 'Verified Partner Approval (R. Ford) via email thread.', icon: UserCheck, done: currentStep >= 2 },
                      { title: 'Core ERP Data Sync', desc: 'Validated Matter KRL-MAT-2025-0143 and Client ID.', icon: Database, done: currentStep >= 3 },
                    ].map((step, idx) => {
                      const isActive = status === 'processing' && currentStep === idx;
                      const isPast = currentStep > idx || status === 'done';
                      return (
                        <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active transition-opacity duration-300 ${isPast || isActive ? 'opacity-100' : 'opacity-40'}`}>
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isPast ? 'border-emerald-500' : isActive ? 'border-[#00263A]' : 'border-slate-300'}`}>
                            {isPast ? <Check className="w-3 h-3 text-emerald-500" /> : <step.icon className={`w-3 h-3 ${isActive ? 'text-[#00263A] animate-pulse' : 'text-slate-400'}`} />}
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${isPast ? 'text-emerald-700' : isActive ? 'text-[#00263A]' : 'text-slate-700'}`}>{step.title}</span>
                              {isActive && <Loader2 className="w-3 h-3 text-[#00263A] animate-spin" />}
                            </div>
                            <p className="text-[10px] text-slate-500">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {status === 'done' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center mt-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-emerald-900 mb-1">Draft KRL-INV-4941 Generated</h3>
                <p className="text-xs text-emerald-700 mb-5">Manual billing request successfully processed into a draft invoice.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={onBack} className="w-full px-4 py-2 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                    Return to Hub
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </Panel>
      </div>
    </motion.div>
  );
};


// ─── Credit / Rebill ──────────────────────────────────────────────────────────

const CreditRebillView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'dispute' | 'contract' | 'generation' | 'review' | 'execution'>('dispute');
  const labels = ['Dispute Analysis', 'Contract Verification', 'Document Generation', 'Review & Approval', 'Execution'];
  const steps = ['dispute', 'contract', 'generation', 'review', 'execution'] as const;

  // Handlers
  const handleNext = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };
  const handleBackStep = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
      <SubViewHeader title="Credit / Rebill Handling" badge="AI-Automated" onBack={onBack} />

      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          {steps.map((s, i) => {
            const done = steps.indexOf(step) > i;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 transition-all flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[#00263A] text-white ring-2 ring-[#C5DAE8]' : 'bg-slate-200 text-slate-500'}`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full whitespace-pre-line ${active ? 'text-[#00263A]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {labels[i]}
                  </span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-0.5 mx-1 min-w-[20px] mt-[-16px]">
                  <div className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Dispute Analysis */}
        {step === 'dispute' && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 text-rose-500" /><h2 className="text-sm font-semibold text-slate-800">Client Dispute Received</h2></div>
                <Card title="Client Communication" accent="rose">
                  <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1"><span className="font-semibold text-slate-700">From:</span> a.miller@aldridgepharma.com</p>
                      <p className="text-[10px] text-slate-500 mb-2"><span className="font-semibold text-slate-700">Subject:</span> Incorrect billing on KRL-INV-5501</p>
                      <p className="text-xs text-slate-700 italic">"We received invoice KRL-INV-5501, but the 15 hours of consulting were billed at the Partner rate ($850/hr) instead of the agreed Associate rate ($350/hr). Please correct this."</p>
                    </div>
                  </div>
                </Card>
                <Card title="Original Invoice">
                  <FieldRow label="Invoice Ref" value="KRL-INV-5501" mono highlight />
                  <FieldRow label="Client" value="Aldridge Pharma Group" />
                  <FieldRow label="Billed Amount" value="$12,750.00" />
                  <FieldRow label="Line Item" value="15.0h × $850/hr (Partner)" />
                </Card>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Dispute Resolution Agent</h2></div>
                <Card title="AI Extraction & Intent" accent="navy">
                  <div className="space-y-2">
                    <CheckRow status="pass" text="Intent classified: Billing dispute / Rate mismatch" />
                    <CheckRow status="pass" text="Target invoice identified: KRL-INV-5501" />
                    <CheckRow status="pass" text="Disputed claim: Billed Partner ($850), Expected Associate ($350)" />
                  </div>
                </Card>
                <Card title="Recommended Next Step">
                  <p className="text-xs text-slate-600 mb-3">Proceed to Contract Verification to validate the client's rate card claim against the active Core ERP Master Service Agreement.</p>
                  <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors">
                    Verify Contract Rates <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* Contract Verification */}
        {step === 'contract' && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><FileCheck className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Contract & Rate Card Evidence</h2></div>
                <Card title="Active Agreement Details" accent="navy">
                  <FieldRow label="MSA Reference" value="MSA-ALD-2024" mono />
                  <FieldRow label="Status" value="Active (Valid thru Dec 2026)" highlight />
                  <FieldRow label="Resource Name" value="J. Smith" />
                  <FieldRow label="Resource Level" value="Associate" highlight />
                </Card>
                <Card title="Rate Card Match" accent="emerald">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase">
                        <th className="py-2 text-left font-semibold">Tier</th>
                        <th className="py-2 text-right font-semibold">Contract Rate</th>
                        <th className="py-2 text-right font-semibold">Billed Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="py-2 font-medium text-slate-400">Partner</td>
                        <td className="py-2 text-right text-slate-400">$850/hr</td>
                        <td className="py-2 text-right text-rose-600 font-bold">$850/hr (Applied)</td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td className="py-2 font-medium text-emerald-800">Associate</td>
                        <td className="py-2 text-right text-emerald-800 font-bold">$350/hr</td>
                        <td className="py-2 text-right text-emerald-800 font-bold">— (Missing)</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Contract Verification Agent</h2></div>
                <Card title="AI Analysis Conclusion" accent="emerald">
                  <div className="space-y-0.5">
                    <CheckRow status="pass" text="Client claim validated: J. Smith is an Associate." />
                    <CheckRow status="pass" text="Correct rate should be $350/hr." />
                    <CheckRow status="fail" text="Original invoice KRL-INV-5501 overbilled by $7,500.00." />
                  </div>
                  <div className="mt-4 p-3 bg-slate-100 rounded border border-slate-200">
                    <p className="text-[10px] font-mono text-slate-600">Calculated Variance: (15h × $850) - (15h × $350) = $7,500.00</p>
                  </div>
                </Card>
                <Card title="Recommended Action">
                  <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors">
                    Generate Documents <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* Document Generation */}
        {step === 'generation' && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Proposed Draft Documents</h2></div>
                <Card title="Draft Credit Memo (Reversal)" accent="rose">
                  <FieldRow label="Credit Memo" value="KRL-CR-5501-A (Draft)" mono highlight />
                  <FieldRow label="Target Invoice" value="KRL-INV-5501" mono />
                  <FieldRow label="Credit Amount" value="($12,750.00)" highlight />
                  <FieldRow label="Reason Code" value="RATE_CORRECTION" />
                </Card>
                <Card title="Draft Re-bill Invoice (Correction)" accent="emerald">
                  <FieldRow label="New Invoice" value="KRL-INV-5502 (Draft)" mono highlight />
                  <FieldRow label="Client" value="Aldridge Pharma Group" />
                  <FieldRow label="Corrected Amount" value="$5,250.00" highlight />
                  <FieldRow label="Line Item" value="15.0h × $350/hr (Associate)" />
                </Card>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Document AI Agent</h2></div>
                <Card title="AI Strategy: Reverse & Rebill" accent="navy">
                  <p className="text-xs text-slate-600 mb-3">
                    To maintain clean ledger hygiene and comply with Core ERP audit requirements, the system proposes a full reversal of the original invoice via credit memo, followed by a net-new corrected invoice.
                  </p>
                  <div className="space-y-0.5">
                    <CheckRow status="pass" text="Credit memo matches original exact total." />
                    <CheckRow status="pass" text="Rebill invoice mapped to correct MSA rates." />
                    <CheckRow status="pass" text="Tax recalculated on $5,250.00 base." />
                  </div>
                </Card>
                <Card title="Recommended Action">
                  <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors">
                    Proceed to Human Review <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* Review & Approval */}
        {step === 'review' && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><ClipboardCheck className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Human Authorization Required</h2></div>
                <Card title="Net Balance Impact Summary" accent="navy">
                  <div className="p-3 bg-[#E8F0F5] rounded-lg border border-[#C5DAE8] mb-3">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[#00263A] font-medium">Original Invoice AR:</span>
                      <span className="text-[#00263A] font-mono">$12,750.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-rose-600 font-medium">Credit Memo Impact:</span>
                      <span className="text-rose-600 font-mono">($12,750.00)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-emerald-700 font-medium">New Re-bill Invoice:</span>
                      <span className="text-emerald-700 font-mono">$5,250.00</span>
                    </div>
                    <div className="h-px bg-[#C5DAE8] my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-[#00263A] font-bold text-sm">Net Client Adjustment:</span>
                      <span className="text-[#00263A] font-bold font-mono text-sm">($7,500.00)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Posting these documents will reduce the client's total AR balance by $7,500.00 and mark the dispute as resolved.</p>
                </Card>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <Card title="Approval Gate" accent="emerald">
                  <p className="text-xs text-slate-600 mb-6 text-center">Please review the proposed documents and financial impact before approving the automated posting sequence.</p>
                  <div className="space-y-3">
                    <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg active:scale-95 duration-200">
                      <CheckCircle2 className="w-4 h-4" /> Approve & Post to Core ERP
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                      Modify Drafts
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors">
                      Reject Resolution
                    </button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* Core ERP Execution */}
        {step === 'execution' && (
          <>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><Settings className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Core ERP Execution Agent</h2></div>
                <Card title="System Actions" accent="emerald">
                  <div className="space-y-3 p-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-700">Posted Credit Memo <span className="font-mono font-semibold">KRL-CR-5501-A</span> to Core ERP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-700">Posted Re-bill Invoice <span className="font-mono font-semibold">KRL-INV-5502</span> to Core ERP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-700">Linked documents in audit trail</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-700 font-medium">Updating Client Portal & AR Aging...</span>
                    </div>
                  </div>
                </Card>
                <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm mt-4">
                  <div className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider mb-1">Automation Successful</div>
                  <p className="text-xs text-white/80">The billing error has been fully corrected. The ledger is clean and the new invoice is active.</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-[#00263A]" /><h2 className="text-sm font-semibold text-slate-800">Communications Agent</h2></div>
                <Card title="Client Notification Sent" accent="navy">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-700 space-y-3">
                    <p><span className="font-semibold text-slate-500">To:</span> a.miller@aldridgepharma.com</p>
                    <p><span className="font-semibold text-slate-500">Subject:</span> Resolved: Billing Correction for KRL-INV-5501</p>
                    <div className="h-px bg-slate-100" />
                    <p>Dear Aldridge Pharma Team,</p>
                    <p>Thank you for bringing the rate discrepancy on invoice KRL-INV-5501 to our attention. We have reviewed the master service agreement and confirmed the error.</p>
                    <p>We have issued a credit memo (KRL-CR-5501-A) to void the original charge, and attached the corrected invoice (KRL-INV-5502) reflecting the accurate Associate rate of $350/hr.</p>
                    <p>Please let us know if you have any further questions.</p>
                    <div className="flex gap-2 mt-4">
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px]"><FileText className="w-3 h-3" /> KRL-CR-5501-A.pdf</span>
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px]"><FileText className="w-3 h-3" /> KRL-INV-5502.pdf</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Footer Nav */}
      <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center shrink-0">
        {step !== 'dispute' && step !== 'execution' ? (
          <button onClick={handleBackStep} className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors">
            Back
          </button>
        ) : <div />}
        {step === 'execution' && (
          <button onClick={onBack} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg active:scale-95 duration-200">
            Return to Dashboard
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Portal Rejections ────────────────────────────────────────────────────────

const PortalRejectionsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selected, setSelected] = useState(0);
  const rejections = [
    { invoice: 'KRL-INV-2026-4888', client: 'Harlow Crane LLP', portal: 'Client Portal', code: 'ERR-4012', reason: 'Missing PO reference number', amount: '$142,500', age: '2h', severity: 'high' as const },
    { invoice: 'KRL-INV-2026-4901', client: 'Vantage Global Advisors', portal: 'Coupa', code: 'ERR-2201', reason: 'Tax ID format incorrect for EU submission', amount: '$38,750', age: '4h', severity: 'medium' as const },
    { invoice: 'KRL-INV-2026-4876', client: 'Pinnacle Global', portal: 'Tungsten', code: 'ERR-1105', reason: 'Duplicate invoice number detected', amount: '$95,000', age: '6h', severity: 'low' as const },
  ];
  const resolutions: Record<string, { cause: string; steps: string[]; fix: string }> = {
    'ERR-4012': { cause: 'Client PO number not mapped in Core ERP at time of invoice generation. Required by Harlow Crane LLP Portal.', steps: ['Retrieve PO-2026-HC-0041 from client procurement system', 'Update invoice in Core ERP with PO reference', 'Re-validate against Portal schema', 'Resubmit via Client Portal'], fix: 'PO number updated — resubmission queued' },
    'ERR-2201': { cause: 'EU submissions require VAT in XX999999999 format. Submitted without country prefix.', steps: ['Identify correct EU VAT format for jurisdiction', 'Update billing entity VAT format in Core ERP', 'Regenerate invoice with corrected tax ID', 'Resubmit to Coupa portal'], fix: 'Tax ID corrected — resubmission ready' },
    'ERR-1105': { cause: 'Invoice number matched a previously voided invoice in Tungsten portal database.', steps: ['Confirm original was properly voided in Core ERP and portal', 'Assign new invoice number: KRL-INV-2026-4876-A', 'Resubmit with new reference'], fix: 'New invoice number assigned — submitting' },
  };
  const sel = rejections[selected];
  const res = resolutions[sel.code];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
      <SubViewHeader title="Portal Rejections" badge="AI-Automated" onBack={onBack} />
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        <span className="text-xs font-semibold text-slate-700">{rejections.length} Active Rejections</span>
        <span className="ml-auto text-[10px] text-slate-400">Real-time monitoring · Client Portal · Coupa · Tungsten</span>
      </div>
      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-72 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0 p-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Rejection Queue</div>
          <div className="space-y-2">
            {rejections.map((r, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selected === i ? 'border-[#00263A] bg-[#F0F5F8] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-[#00263A]">{r.invoice}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${r.severity === 'high' ? 'bg-rose-100 text-rose-700' : r.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{r.severity}</span>
                </div>
                <div className="text-xs text-slate-700 font-medium">{r.client}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">{r.portal} · {r.code}</span>
                  <span className="text-[10px] text-slate-400">{r.age} ago</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-2 mb-1"><Brain className="w-4 h-4 text-[#00263A]" /><span className="text-sm font-semibold text-slate-800">Root Cause Analysis</span></div>
            <p className="text-xs text-slate-400 mb-4">{sel.portal} · {sel.code}</p>
            <Card title="Rejection Details">
              <FieldRow label="Invoice" value={sel.invoice} mono highlight />
              <FieldRow label="Client" value={sel.client} />
              <FieldRow label="Portal" value={sel.portal} />
              <FieldRow label="Amount" value={sel.amount} highlight />
              <FieldRow label="Rejection Code" value={sel.code} mono />
              <FieldRow label="Reason" value={sel.reason} />
              <FieldRow label="Age" value={`${sel.age} ago`} />
            </Card>
            <Card title="AI Root Cause" accent="amber">
              <p className="text-xs text-amber-900">{res.cause}</p>
            </Card>
            <Card title="Resolution Steps" accent="navy">
              <div className="space-y-2">
                {res.steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#7AADCB]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-[#7AADCB]">{i + 1}</span>
                    </div>
                    <span className="text-xs text-white/80">{s}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">{res.fix}</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors">
                <RotateCcw className="w-3 h-3" />Resubmit
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Workflow Flow Node components ────────────────────────────────────────────

const FlowConnector: React.FC<{ vertical?: boolean }> = ({ vertical }) =>
  vertical ? (
    <div className="flex flex-col items-center py-1">
      <div className="w-0.5 h-4 bg-slate-300" />
      <ArrowDown className="w-3.5 h-3.5 text-slate-400 -mt-1" />
    </div>
  ) : (
    <div className="flex items-center w-8 flex-shrink-0">
      <div className="w-4 h-0.5 bg-slate-300" />
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 -ml-1.5" />
    </div>
  );

const FlowNode: React.FC<{
  id: ProcessId;
  Icon: React.FC<{ className?: string }>;
  title: string;
  tagline: string;
  badge: string;
  badgeColor?: 'navy' | 'amber';
  featured?: boolean;
  onSelect: (id: ProcessId) => void;
}> = ({ id, Icon, title, tagline, badge, badgeColor = 'navy', featured, onSelect }) => (
  <button onClick={() => onSelect(id)}
    className={`flex-1 flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all group min-w-0
      ${featured
        ? 'bg-[#00263A] border-[#00263A] hover:bg-[#003354] shadow-lg'
        : 'bg-white border-slate-200 hover:border-[#00263A] hover:shadow-md'
      }`}>
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${featured ? 'bg-[#7AADCB]/20' : 'bg-slate-50 group-hover:bg-[#E8F0F5]'} transition-colors`}>
        <Icon className={`w-4 h-4 ${featured ? 'text-[#7AADCB]' : 'text-[#00263A]'}`} />
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        featured ? 'bg-[#7AADCB]/20 text-[#7AADCB]'
        : badgeColor === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-[#00263A]/10 text-[#00263A]'
      }`}>{badge}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className={`text-sm font-semibold mb-1 ${featured ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-xs leading-relaxed ${featured ? 'text-white/65' : 'text-slate-500'}`}>{tagline}</p>
    </div>
    <div className={`flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all ${featured ? 'text-[#7AADCB]' : 'text-[#00263A]'}`}>
      View process <ChevronRight className="w-3.5 h-3.5" />
    </div>
  </button>
);

const ExceptionNode: React.FC<{
  id: ProcessId;
  Icon: React.FC<{ className?: string }>;
  title: string;
  tagline: string;
  trigger: string;
  badge: string;
  badgeColor?: 'navy' | 'amber';
  onSelect: (id: ProcessId) => void;
}> = ({ id, Icon, title, tagline, trigger, badge, badgeColor = 'navy', onSelect }) => (
  <button onClick={() => onSelect(id)}
    className="flex-1 flex flex-col gap-3 p-4 rounded-xl border border-dashed border-slate-300 bg-white text-left transition-all group hover:border-[#00263A] hover:shadow-md hover:bg-slate-50/50 min-w-0">
    <div className="flex items-center justify-between">
      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-[#E8F0F5] transition-colors">
        <Icon className="w-4 h-4 text-[#00263A]" />
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        badgeColor === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#00263A]/10 text-[#00263A]'
      }`}>{badge}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-2">{tagline}</p>
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        Triggered when: {trigger}
      </span>
    </div>
    <div className="flex items-center gap-1 text-xs font-semibold text-[#00263A] group-hover:gap-2 transition-all">
      View process <ChevronRight className="w-3.5 h-3.5" />
    </div>
  </button>
);

// ─── Hub Page ─────────────────────────────────────────────────────────────────

const HubView: React.FC<{ onSelect: (id: ProcessId) => void; taskStatuses: Record<string, string> }> = ({ onSelect, taskStatuses }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">

    {/* Page Header */}
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-base font-semibold text-slate-800">Invoicing & Billing Execution</h1>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E8F0F5] border border-[#C5DAE8] rounded-full">
            <Zap className="w-2.5 h-2.5 text-[#00263A]" />
            <span className="text-[10px] font-semibold text-[#00263A]">AI-Driven End-to-End</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">Kroll Receivables Intelligence · Full billing lifecycle · Core ERP · Client Portal · Audit trail active</p>
      </div>
      <div className="text-right">
        <div className="text-xs font-semibold text-slate-700">Alex Rivers</div>
        <div className="text-[10px] text-slate-400">Director, Receivables · Global Finance</div>
      </div>
    </div>

    {/* KPI Strip */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Invoices This Month</span>
          <TrendingUp className="w-3.5 h-3.5 text-[#7AADCB]" />
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-0.5">1,847</div>
        <div className="text-[10px] text-[#7AADCB]">+14% vs. prior month · Audit-ready</div>
      </div>
      <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Billing Accuracy</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#7AADCB]" />
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-0.5">99.2%</div>
        <div className="text-[10px] text-[#7AADCB]">AI validation before every issuance</div>
      </div>
      <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Portal Delivery Rate</span>
          <Upload className="w-3.5 h-3.5 text-[#7AADCB]" />
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-0.5">97.4%</div>
        <div className="text-[10px] text-[#7AADCB]">First-pass acceptance across all portals</div>
      </div>
      <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Open Rejections</span>
          <AlertCircle className="w-3.5 h-3.5 text-[#7AADCB]" />
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-0.5">3</div>
        <div className="text-[10px] text-[#7AADCB]">Active · all within SLA · AI resolving</div>
      </div>
    </div>

    {/* Active Action Items -> Inbox */}
    <div className="mb-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#00263A] mb-1">Task Inbox</h3>
          <p className="text-xs text-slate-500">Select a pending task to execute the required workflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Task / Case</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client / Entity</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Item 1 */}
            <tr className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onSelect('generation')}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#E8F0F5] text-[#00263A]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Pending Invoice Generation</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">3 draft invoices require AI validation</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">End-to-End</span>
              </td>
              <td className="px-4 py-4">
                <div className="text-xs text-slate-700 font-medium">Multiple (3)</div>
                <div className="text-[10px] font-mono text-slate-400">Pinnacle Capital & Others</div>
              </td>
              <td className="px-4 py-4">
                {taskStatuses.generation === 'Pending' ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full w-fit">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" /> Generated
                  </span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#00263A] group-hover:text-[#003354] transition-colors">
                  {taskStatuses.generation === 'Pending' ? 'Review Inbox' : 'View Output'} <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>

            {/* Item 2 */}
            <tr className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onSelect('credit')}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#E8F0F5] text-[#00263A]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Approve Credit & Rebill #CR-8921</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rate discrepancy detected</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Exception</span>
              </td>
              <td className="px-4 py-4">
                <div className="text-xs text-slate-700 font-medium">Aldridge Pharma Group</div>
                <div className="text-[10px] font-mono text-slate-400">KRL-INV-2026-4932</div>
              </td>
              <td className="px-4 py-4">
                {taskStatuses.credit === 'Pending' ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full w-fit">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" /> Generated
                  </span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#00263A] group-hover:text-[#003354] transition-colors">
                  {taskStatuses.credit === 'Pending' ? 'Review Exception' : 'View Output'} <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>

            {/* Item 3 */}
            <tr className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => onSelect('manual')}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#E8F0F5] text-[#00263A]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Review Manual Invoice #MI-405</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Non-standard milestone charges</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Exception</span>
              </td>
              <td className="px-4 py-4">
                <div className="text-xs text-slate-700 font-medium">Sterling Trust Bank</div>
                <div className="text-[10px] font-mono text-slate-400">KRL-MAT-2025-0156</div>
              </td>
              <td className="px-4 py-4">
                {taskStatuses.manual === 'Pending' ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full w-fit">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" /> Generated
                  </span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#00263A] group-hover:text-[#003354] transition-colors">
                  {taskStatuses.manual === 'Pending' ? 'Review Request' : 'View Output'} <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);

// ─── Root Export ──────────────────────────────────────────────────────────────

export const InvoicingBillingView: React.FC = () => {
  const [activeProcess, setActiveProcess] = useState<ProcessId>(null);
  const [invoices, setInvoices] = useState<GeneratedInvoice[]>(GENERATED_INVOICES);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({
    generation: 'Pending',
    credit: 'Pending',
    manual: 'Pending'
  });

  const handleBack = () => {
    if (activeProcess && ['generation', 'credit', 'manual'].includes(activeProcess)) {
      setTaskStatuses(prev => ({ ...prev, [activeProcess]: 'Generated' }));
    }
    setActiveProcess(null);
  };

  const handleUpdateInvoice = (id: string, status: InvStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full">
      <AnimatePresence mode="wait">
        {activeProcess === null && <HubView key="hub" onSelect={setActiveProcess} taskStatuses={taskStatuses} />}
        {activeProcess === 'generation' && (
          <InvoiceGenerationView
            key="generation"
            onBack={handleBack}
            invoices={invoices}
            onUpdateInvoice={handleUpdateInvoice}
            onProceed={(process) => setActiveProcess(process)}
          />
        )}
        {activeProcess === 'review' && <InvoiceReviewApprovalView key="review" onBack={handleBack} onGoToDelivery={() => setActiveProcess('delivery')} fromGeneration />}
        {activeProcess === 'delivery' && (
          <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col h-full">
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Billing Execution
              </button>
              <div className="w-px h-4 bg-slate-200" />
              <h2 className="text-sm font-semibold text-slate-800">Invoice Issuance & Delivery</h2>
              <span className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#00263A] rounded-full">
                <Zap className="w-2.5 h-2.5 text-[#7AADCB]" />
                <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">AI-Automated</span>
              </span>
            </div>
            <InvoiceDeliveryView />
          </motion.div>
        )}
        {activeProcess === 'manual' && <ManualBillingView key="manual" onBack={handleBack} />}
        {activeProcess === 'credit' && <CreditRebillView key="credit" onBack={handleBack} />}
        {activeProcess === 'rejections' && <PortalRejectionsView key="rejections" onBack={handleBack} />}
      </AnimatePresence>
    </div>
  );
};
