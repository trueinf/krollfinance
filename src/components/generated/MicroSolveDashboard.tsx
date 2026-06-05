import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { LayoutDashboard, Inbox, AlertCircle, Cpu, BarChart3, History, Settings, Globe, User, Search, Bell, RefreshCw, Zap, CheckCircle2, XCircle, Clock, ArrowLeft, Download, FileText, Loader2, Check, ArrowRight, Mail, Building2, DollarSign, Calendar, FileCheck, PhoneCall, TrendingUp, Clock3, MessageSquare, ThumbsUp, ThumbsDown, Mic, Activity, TrendingDown, Frown, Angry, HelpCircle, AlertTriangle, Smile, Shield, Brain, ChevronDown, ChevronRight, Package, Truck, Phone, ArrowUpCircle, FileQuestion, CreditCard, Lock, Send, Edit, Info, Link as LinkIcon, Award, Target, Flag, X, Loader, MessageCircle, Eye, FileSearch, Monitor, CheckCircle, UserCog, ShieldAlert, ArrowUpRight, Sparkles, Users, Filter, Database, Play, Pause, Tag, Paperclip, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { InvoiceDeliveryView } from './InvoiceDeliveryView';
import { CustomerMasterDataView } from './CustomerMasterDataView';

interface Remittance {
  id: string;
  emailId: string;
  customer: string;
  amount: string;
  region: string;
  confidence: number;
  age: string;
  status: 'Failed' | 'Ready' | 'Processing' | 'Posted' | 'Touchless';
  isNew?: boolean;
  resolutionType?: string;
  aiContext?: string;
}
interface SentimentEntry {
  id: number;
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused' | 'anxious' | 'satisfied';
  confidence: number;
  indicators?: string[];
  recommendation?: string;
  timestamp: Date;
}

interface CallAnalysisProps {
  sentimentHistory: SentimentEntry[];
  sentimentTimelineRef: React.RefObject<HTMLDivElement | null>;
}


type ViewType = 'overview' | 'dashboard' | 'ai-processing' | 'posting' | 'success' | 'exception-workbench' | 'call-analysis' | 'disputes' | 'ptp' | 'customer-master' | 'qa' | 'help' | 'invoice-delivery';
interface AIStep {
  id: number;
  title: string;
  details: string[];
  confidence?: string;
}

// Promise to Pay interfaces
interface IncomingEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedDate: string;
  isProcessed: boolean;
}

interface ExtractionData {
  customer_name: string;
  email: string;
  invoice_numbers: string[];
  promised_amount: number;
  currency: string;
  promised_date: string | null;
  free_text_notes: string;
  sentiment: string;
  tone: string;
}

interface EnrichmentData {
  invoice_due_date: string;
  days_past_due: number;
  previous_ptp_count: number;
  previous_ptp_kept: number;
  previous_ptp_broken: number;
  open_dispute: boolean;
  customer_category: string;
  risk_segment: string;
  payment_history_score: number;
  open_amount: number;
  ageing_bucket: string;
  cltv: number;
  customer_since: string;
  total_revenue_ytd: number;
  avg_days_to_pay: number;
  credit_limit: number;
  credit_utilization: number;
  last_payment_date: string;
  last_payment_amount: number;
}

interface PtpScoringData {
  ptp_confidence_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  predicted_payment_date: string | null;
  ptp_type: 'Customer-declared' | 'Inferred' | 'Vague-declared';
  recommendation: string;
  score_factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    points: number;
    detail: string;
  }[];
}

interface PtpRecord {
  id: string;
  customer: string;
  invoice: string;
  amount: number;
  currency: string;
  commitment_date: string | null;
  commitment_text?: string;
  predicted_pay_date: string | null;
  confidence_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  ptp_type: 'Customer-declared' | 'Inferred' | 'Vague-declared';
  owner: string;
  last_interaction: string;
  sentiment: string;
  recommended_action: string;
  created_date: string;
  history_total: number;
  history_kept: number;
  history_broken: number;
  ageing?: string;
  status: 'Active' | 'Fulfilled' | 'Broken';
}
const INITIAL_DATA: Remittance[] = [{
  id: '1',
  emailId: 'REM_001',
  customer: 'Brightline Industries',
  amount: '£98,000',
  region: 'EMEA',
  confidence: 81,
  age: '3h',
  status: 'Failed'
}, {
  id: '3',
  emailId: 'REM_003',
  customer: 'Meridian Capital Partners',
  amount: '$210,000',
  region: 'APAC',
  confidence: 92,
  age: '1h',
  status: 'Failed'
}];
const NEW_REMITTANCES_POOL: Remittance[] = [{
  id: '4',
  emailId: 'REM_004',
  customer: 'Harlow Crane LLP',
  amount: '$142,500',
  region: 'NA',
  confidence: 85,
  age: 'Just now',
  status: 'Ready',
  isNew: true,
  aiContext: 'Missing remittance'
}, {
  id: '5',
  emailId: 'REM_005',
  customer: 'Sterling Trust Bank',
  amount: '$98,000',
  region: 'EMEA',
  confidence: 82,
  age: 'Just now',
  status: 'Ready',
  isNew: true
}, {
  id: '6',
  emailId: 'REM_006',
  customer: 'Aldridge Pharma Group',
  amount: '$180,000',
  region: 'NA',
  confidence: 96,
  age: 'Just now',
  status: 'Ready',
  isNew: true
}, {
  id: '7',
  emailId: 'REM_007',
  customer: 'Nakamura Holdings KK',
  amount: '$100,000',
  region: 'APAC',
  confidence: 94,
  age: 'Just now',
  status: 'Ready',
  isNew: true
}, {
  id: '8',
  emailId: 'REM_008',
  customer: 'Castellan Restructuring Ltd',
  amount: '$50,000',
  region: 'EMEA',
  confidence: 91,
  age: 'Just now',
  status: 'Ready',
  isNew: true
}, {
  id: '9',
  emailId: 'REM_009',
  customer: 'Vantage Global Advisors',
  amount: '$25,000',
  region: 'EMEA',
  confidence: 92,
  age: 'Just now',
  status: 'Ready',
  isNew: true
}, {
  id: '10',
  emailId: 'REM_010',
  customer: 'Harborview Partners LLP',
  amount: '$125,000',
  region: 'NA',
  confidence: 88,
  age: 'Just now',
  status: 'Ready',
  isNew: true,
  aiContext: 'Possible duplicate / misapplied'
}, {
  id: '11',
  emailId: 'REM_011',
  customer: 'Calderwood Advisory Group',
  amount: '$80,250',
  region: 'EMEA',
  confidence: 90,
  age: 'Just now',
  status: 'Ready',
  isNew: true,
  aiContext: 'Overpayment — refund + write-off'
}];
const AI_STEPS_BASE: AIStep[] = [{
  id: 1,
  title: 'Reading Remittance',
  details: ['Email identified', 'Bank: Citi']
}, {
  id: 2,
  title: 'Extracting Payment Data',
  details: ['Customer → Aldridge Pharma Group', 'Amount → $180,000', 'Invoice Ref → KRL-INV-4845'],
  confidence: 'Confidence: 98%'
}, {
  id: 3,
  title: 'Matching Customer',
  details: ['Customer master match found']
}, {
  id: 4,
  title: 'Fetching Open Invoices',
  details: ['Invoice found: KRL-INV-4845', 'Amount → $180,000']
}, {
  id: 5,
  title: 'AI Decision',
  details: ['High confidence match', 'Touchless processing eligible']
}];

const AI_STEPS_EXTENDED: AIStep[] = [
  ...AI_STEPS_BASE,
  { id: 6, title: 'Resolve Exception', details: ['Awaiting user interaction'] },
  { id: 7, title: 'Posting to D365', details: ['Writing to D365'] },
  { id: 8, title: 'Complete', details: ['Transaction finalized'] }
];
const AI_STEPS_NORTHWIND: AIStep[] = [
  { id: 1, title: 'Reading Remittance', details: ['Email identified', 'Bank: Bank of America'] },
  { id: 2, title: 'Extracting Payment Data', details: ['Payment metadata extracted', 'Case ID generated'] },
  { id: 3, title: 'Matching Customer', details: ['Customer → Harlow Crane LLP', 'Customer ID → CL-2025-0304'] },
  { id: 4, title: 'Fetching Open Invoices', details: ['5 invoices retrieved', 'No single match found'] },
  { id: 5, title: 'AI Decision', details: ['Automatic allocation not possible', 'Customer outreach required'] },
  { id: 6, title: 'AI Email Draft', details: ['Email generated', 'Ready to send'] },
  { id: 7, title: 'Awaiting Response', details: ['Email sent', 'Monitoring mailbox'] },
  { id: 8, title: 'Response Received', details: ['Customer replied', 'Remittance attached'] },
  { id: 9, title: 'Parsed Response', details: ['Allocation extracted', 'Validation passed'] },
  { id: 10, title: 'Matching Successful', details: ['Allocation confirmed', 'Ready to post'] },
  { id: 11, title: 'AI Decision', details: ['Ready for auto posting', 'Automation resumed'] },
  { id: 12, title: 'Posting to D365', details: ['Writing to D365', 'Transaction processing'] },
  { id: 13, title: 'Success', details: ['Cash application completed', 'Transaction finalized'] }
];

const AI_STEPS_BLUEWAVE: AIStep[] = [
  { id: 1, title: 'Case Overview', details: ['Case summary', 'Payment variance'] },
  { id: 2, title: 'Payment Matching', details: ['Match & Reconciliation Agent'] },
  { id: 3, title: 'Remittance Analysis', details: ['Document AI Agent'] },
  { id: 4, title: 'Tax Profile', details: ['Customer tax profile'] },
  { id: 5, title: 'Withholding Validation', details: ['Withholding Reasoning Agent'] },
  { id: 6, title: 'Resolution Recommendation', details: ['AI decision'] },
  { id: 7, title: 'D365 Posting Preview', details: ['Journal entry proposal'] },
  { id: 8, title: 'Documentation Request', details: ['Generated email'] },
  { id: 9, title: 'Documentation Received', details: ['Proof in attachments', 'Ready to post'] },
  { id: 10, title: 'Approval', details: ['Approve & Post'] },
  { id: 11, title: 'Resolution Completed', details: ['Success'] }
];

const AI_STEPS_NIHON: AIStep[] = [
  { id: 1, title: 'Case Overview', details: ['Case summary', 'Payment variance'] },
  { id: 2, title: 'Payment Matching', details: ['Match & Reconciliation Agent'] },
  { id: 3, title: 'Remittance Analysis', details: ['Remittance Extraction Agent'] },
  { id: 4, title: 'Tax Profile', details: ['Customer tax profile'] },
  { id: 5, title: 'Withholding Analysis', details: ['Withholding Reasoning Agent'] },
  { id: 6, title: 'AI Decision', details: ['AI Decision Engine'] },
  { id: 7, title: 'Accounting Recommendation', details: ['Posting proposal'] },
  { id: 8, title: 'Customer Communication', details: ['Email draft'] },
  { id: 9, title: 'Dispute Case', details: ['Internal case'] },
  { id: 10, title: 'Final Approval', details: ['Approve & Post'] },
  { id: 11, title: 'Resolution Completed', details: ['Success'] }
];

const AI_STEPS_BANKFEE: AIStep[] = [
  { id: 1, title: 'Case Overview', details: ['Case summary', 'Payment variance'] },
  { id: 2, title: 'Bank Fee Likelihood', details: ['Match & Reconciliation Agent'] },
  { id: 3, title: 'Remittance Analysis', details: ['Document AI Agent'] },
  { id: 4, title: 'Policy Check', details: ['Absorb vs Chargeback'] },
  { id: 5, title: 'Resolution Recommendation', details: ['AI decision'] },
  { id: 6, title: 'D365 Posting Preview', details: ['Journal entry proposal'] },
  { id: 7, title: 'Customer Outreach', details: ['If chargeback: email draft'] },
  { id: 8, title: 'Approval', details: ['Approve & Post'] },
  { id: 9, title: 'Resolution Completed', details: ['Success'] }
];

const AI_STEPS_REFUND: AIStep[] = [
  { id: 1, title: 'Case Overview', details: ['Case summary', 'Overpayment via direct debit'] },
  { id: 2, title: 'Overpayment Detection', details: ['Match & Reconciliation Agent'] },
  { id: 3, title: 'Policy & Threshold Check', details: ['Kroll Case Resolution'] },
  { id: 4, title: 'Resolution Split', details: ['AI Decision Engine'] },
  { id: 5, title: 'AI Decision', details: ['AI Decision Engine'] },
  { id: 6, title: 'Refund & Write-Off Posting Proposal', details: ['D365 Posting'] },
  { id: 7, title: 'Human Review / Approval Matrix', details: ['User'] },
  { id: 8, title: 'Posting Execution', details: ['Deterministic enforcement (D365)'] },
  { id: 9, title: 'Resolution Completed', details: ['Complete'] },
];

const AI_STEPS_MISAPPLIED: AIStep[] = [
  { id: 1, title: 'Case Overview', details: ['Case summary', 'Duplicate application'] },
  { id: 2, title: 'Misapplication Detection', details: ['Match & Reconciliation Agent'] },
  { id: 3, title: 'Customer Disambiguation', details: ['Payment Matching Agent'] },
  { id: 4, title: 'Open Invoice Match', details: ['Payment Matching Agent'] },
  { id: 5, title: 'AI Decision', details: ['AI Decision Engine'] },
  { id: 6, title: 'Correction Posting Proposal', details: ['D365 Posting'] },
  { id: 7, title: 'Human Review', details: ['User'] },
  { id: 8, title: 'Posting Execution', details: ['Deterministic enforcement (D365)'] },
  { id: 9, title: 'Resolution Completed', details: ['Complete'] },
];

const STEP_AGENT_MAP: Record<string, string> = {
  'Withholding Analysis': 'Withholding Reasoning Agent',
  'AI Decision': 'AI Decision Engine',
  'Accounting Recommendation': 'Kroll AI Agent',
  'Customer Communication': 'Customer Communications',
  'Dispute Case': 'Case orchestration',
  'Final Approval': 'User',
  'Case Overview': 'Kroll Case Resolution',
  'Payment Matching': 'Match & Reconciliation Agent',
  'Remittance Analysis': 'Remittance Document AI Agent',
  'Tax Profile': 'Customer Tax Profile',
  'Withholding Validation': 'Withholding Reasoning Agent',
  'Resolution Recommendation': 'Kroll AI Agent',
  'D365 Posting Preview': 'D365 Posting',
  'Documentation Request': 'Customer Communications',
  'Documentation Received': 'Case orchestration',
  'Approval': 'User',
  'Resolution Completed': 'Complete',
  'Bank Fee Likelihood': 'Match & Reconciliation Agent',
  'Policy Check': 'Kroll Case Resolution',
  'Customer Outreach': 'Customer Communications',
  'Reading Remittance': 'Bank Statement Normaliser',
  'Extracting Payment Data': 'Remittance Ingestion & Decoding Agent',
  'Matching Customer': 'Payment Matching Agent',
  'Fetching Open Invoices': 'Payment Matching Agent',
  'AI Email Draft': 'Customer Communications Agent',
  'Awaiting Response': 'Case orchestration',
  'Response Received': 'Case orchestration',
  'Parsed Response': 'Remittance Ingestion & Decoding Agent',
  'Matching Successful': 'Payment Matching Agent',
  'Posting to D365': 'Deterministic enforcement (D365)',
  'Resolve Exception': 'Human workbench',
  'Complete': 'Deterministic enforcement',
  'Success': 'Complete',
  'Overpayment Detection': 'Match & Reconciliation Agent',
  'Policy & Threshold Check': 'Kroll Case Resolution',
  'Resolution Split': 'AI Decision Engine',
  'Refund & Write-Off Posting Proposal': 'D365 Posting',
  'Human Review / Approval Matrix': 'User',
  'Misapplication Detection': 'Match & Reconciliation Agent',
  'Customer Disambiguation': 'Payment Matching Agent',
  'Open Invoice Match': 'Payment Matching Agent',
  'Correction Posting Proposal': 'D365 Posting',
  'Human Review': 'User',
  'Posting Execution': 'Deterministic enforcement (D365)'
};
const StatCard = ({
  label,
  value,
  colorClass
}: {
  label: string;
  value: string | number;
  colorClass: string;
}) => <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1 min-w-[160px] flex-1">
    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
    <span className={`text-lg font-semibold ${colorClass}`}>{value}</span>
  </div>;
const SUGGESTED_PHRASES_CONFIG: Record<string, string[]> = {
  frustrated: ["I sincerely apologize...", "I understand your frustration", "Let me fix this right away"],
  angry: ["I'm very sorry for this", "I completely understand", "I'm working on this now"],
  confused: ["Let me clarify that...", "To explain more clearly...", "Does that make sense?"],
  anxious: ["Don't worry, I'll help", "We'll resolve this together", "You're in good hands"],
  neutral: ["Thank you for that info", "Let me check that for you", "I'll look into this"],
  positive: ["I'm glad I could help!", "Thank you for your patience", "Happy to assist you"],
  satisfied: ["I'm glad I could help!", "Thank you for your patience", "Happy to assist you"]
};
const CallAnalysisView = ({ sentimentHistory, sentimentTimelineRef }: CallAnalysisProps) => <motion.div key="call-analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">
  {/* Page Header */}
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-semibold text-slate-800">Call Analysis</h2>
      <p className="text-slate-500 text-sm mt-1">Collections Triage Agent classifies inbound calls and proposes next-best actions. Call Intelligence Agent provides transcription, summaries, and QA flags.</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 shadow-sm">
        <Clock className="w-4 h-4 text-slate-400" />
        Last 30 days
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[#003354] transition-colors">
        <Mic className="w-4 h-4" />
        New Recording
      </button>
    </div>
  </div>

  {/* KPI Cards */}
  <div className="grid grid-cols-4 gap-4 mb-5">
    {[
      { label: 'Total Calls', value: '142', delta: '+12%', icon: PhoneCall, color: 'blue' },
      { label: 'Avg Duration', value: '8.4 min', delta: '-0.6 min', icon: Clock, color: 'purple' },
      { label: 'Positive Sentiment', value: '74%', delta: '+5%', icon: ThumbsUp, color: 'emerald' },
      { label: 'Action Items', value: '38', delta: '12 open', icon: MessageSquare, color: 'amber' },
    ].map((kpi, i) => {
      const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
      };
      return <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[kpi.color]}`}>
            <kpi.icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{kpi.delta}</span>
        </div>
        <div className="text-base font-semibold text-slate-800 mb-1">{kpi.value}</div>
        <div className="text-sm text-slate-500">{kpi.label}</div>
      </div>;
    })}
  </div>

  {/* Call Log Table */}
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden max-w-6xl">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
      <h3 className="font-bold text-slate-800 text-sm">Recent Calls</h3>
      <span className="text-xs text-slate-400">Showing 6 of 142</span>
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 border-b border-slate-100">
          {['Customer', 'Duration', 'Topic', 'Risk tier', 'Date'].map(h => (
            <th key={h} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {[
          { customer: 'Aldridge Pharma Group', duration: '11:24', topic: 'Invoice dispute', date: 'Feb 17', riskTier: 'Tier 0 — Assist' },
          { customer: 'Sterling Trust Bank', duration: '6:08', topic: 'Payment allocation', date: 'Feb 17', riskTier: 'Tier 1 — Draft' },
          { customer: 'Brightline', duration: '14:52', topic: 'Credit limit review', date: 'Feb 16', riskTier: 'Tier 0 — Assist' },
          { customer: 'Harlow Crane', duration: '4:33', topic: 'Remittance query', date: 'Feb 16', riskTier: 'Tier 1 — Draft' },
          { customer: 'Meridian Capital Partners', duration: '9:17', topic: 'Overdue balance', date: 'Feb 15', riskTier: 'Tier 1 — Draft' },
          { customer: 'Horizon Equity Partners', duration: '7:45', topic: 'New payment terms', date: 'Feb 15', riskTier: 'Tier 2 — Controlled auto' },
        ].map((call, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
            <td className="px-4 py-2.5 font-semibold text-slate-800 text-sm">{call.customer}</td>
            <td className="px-4 py-2.5 text-sm font-mono text-slate-500">{call.duration}</td>
            <td className="px-4 py-2.5 text-sm text-slate-500">{call.topic}</td>
            <td className="px-4 py-2.5"><span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">{call.riskTier}</span></td>
            <td className="px-4 py-2.5 text-sm text-slate-400">{call.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="mt-5 flex gap-4 max-w-6xl">
    {/* Live Sentiment Analysis Panel */}
    <div className="flex-[2] bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-w-0">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 text-sm">Live Sentiment Analysis</h3>
            <p className="text-xs text-slate-400">Call Intelligence Agent — transcript, summary, QA flags. No auto-posting actions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sentimentHistory.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Live</span>
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">{sentimentHistory.length} reading{sentimentHistory.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Current Sentiment Display */}
      <div className="p-4">
        {sentimentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No Sentiment Data Yet</p>
            <p className="text-sm text-slate-400 max-w-sm">Start a conversation with the AI assistant below. Sentiment will be tracked automatically after each customer response.</p>
          </div>
        ) : (() => {
          const latest = sentimentHistory[sentimentHistory.length - 1];
          const sentimentConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
            positive: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <ThumbsUp className="w-4 h-4" />, label: 'Positive' },
            neutral: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <User className="w-4 h-4" />, label: 'Neutral' },
            frustrated: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Frown className="w-4 h-4" />, label: 'Frustrated' },
            angry: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <Angry className="w-4 h-4" />, label: 'Angry' },
            confused: { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <HelpCircle className="w-4 h-4" />, label: 'Confused' },
            anxious: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-4 h-4" />, label: 'Anxious' },
            satisfied: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Smile className="w-4 h-4" />, label: 'Satisfied' },
          };
          const config = sentimentConfig[latest.sentiment] || sentimentConfig.neutral;
          const confidencePercent = Math.round(latest.confidence * 100);
          const confidenceColor = confidencePercent >= 80 ? 'bg-emerald-500' : confidencePercent >= 60 ? 'bg-amber-500' : 'bg-red-500';

          return (
            <div className="space-y-6">
              {/* Current Sentiment Card */}
              <div className="flex gap-4">
                {/* Left: Big Sentiment Display */}
                <motion.div
                  key={latest.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex-1 ${config.bg} ${config.border} border-2 rounded-lg p-4 relative overflow-hidden`}
                >

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} ${config.color} border ${config.border}`}>
                        {config.icon}
                      </div>
                      <div>
                        <span className={`text-base font-semibold ${config.color} capitalize`}>{config.label}</span>
                        <p className="text-xs text-slate-500">
                          Detected at {latest.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</span>
                        <span className={`text-sm font-bold ${config.color}`}>{confidencePercent}%</span>
                      </div>
                      <div className="h-2.5 bg-white/80 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${confidencePercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${confidenceColor}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right: Recommendation & Indicators */}
                <div className="flex-1 space-y-4">
                  {/* Recommendation */}
                  {latest.recommendation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">{latest.recommendation}</p>
                    </motion.div>
                  )}

                  {/* Indicators */}
                  {latest.indicators && latest.indicators.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-50 border border-slate-100 rounded-lg p-4"
                    >
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Behavioral Indicators</span>
                      <div className="flex flex-wrap gap-2">
                        {latest.indicators.map((indicator, idx) => (
                          <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 ${config.bg} ${config.color} text-xs font-semibold rounded-full border ${config.border}`}>
                            {config.icon}
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sentiment Timeline */}
              {sentimentHistory.length > 1 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Sentiment Timeline
                    </span>
                    <span className="text-xs text-slate-400">{sentimentHistory.length} changes</span>
                  </div>
                  <div ref={sentimentTimelineRef} className="max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-slate-50">
                      {sentimentHistory.map((entry, i) => {
                        const cfg = sentimentConfig[entry.sentiment] || sentimentConfig.neutral;
                        const prevEntry = i > 0 ? sentimentHistory[i - 1] : null;
                        const changed = prevEntry && prevEntry.sentiment !== entry.sentiment;
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-3 px-4 py-2.5 ${i === sentimentHistory.length - 1 ? 'bg-blue-50/30' : 'hover:bg-slate-50'} transition-colors`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${cfg.color} capitalize`}>{cfg.label}</span>
                                <span className="text-xs text-slate-400 font-mono">{Math.round(entry.confidence * 100)}%</span>
                                {changed && (
                                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase">Changed</span>
                                )}
                              </div>
                              {entry.recommendation && (
                                <p className="text-xs text-slate-400 truncate">{entry.recommendation}</p>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                              {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Suggested Phrases Sidebar */}
    <div className="flex-1 min-w-[320px] flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-700 text-sm">Suggested Responses</h3>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          {sentimentHistory.length > 0 ? (() => {
            const latest = sentimentHistory[sentimentHistory.length - 1];
            const phrases = SUGGESTED_PHRASES_CONFIG[latest.sentiment] || SUGGESTED_PHRASES_CONFIG.neutral;
            return phrases.map((phrase, idx) => (
              <motion.button
                key={`${latest.sentiment}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  navigator.clipboard.writeText(phrase);
                  // Optional: add a small visual feedback of copying
                }}
                className="group relative text-left p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors">
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed font-medium">
                    "{phrase}"
                  </p>
                </div>
              </motion.button>
            ));
          })() : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400">Analysis pending call data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* ElevenLabs Conversational AI Widget */}
  {/* @ts-ignore */}
  <elevenlabs-convai agent-id="agent_2801khqsp034f7d8dr2qyehrazc9"></elevenlabs-convai>

</motion.div>;

export const MicroSolveDashboard = () => {
  const [data, setData] = useState<Remittance[]>(INITIAL_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('KRL-INV-4432');
  const [sentimentHistory, setSentimentHistory] = useState<SentimentEntry[]>([]);
  const sentimentIdRef = useRef(0);
  const sentimentTimelineRef = useRef<HTMLDivElement>(null);
  const systemPromptRef = useRef<string>('');
  const [kpis, setKpis] = useState({
    touchlessRate: 85,
    failedToday: 41,
    autoResolved: 31,
    falseAutoPostRate: 0.4,
    exceptionCycleTimeMins: 2.4
  });

  // Client tools ref — keeps handlers stable across re-renders so the
  // event-listener closure always calls the latest React-state setter.
  const clientToolsRef = useRef({
    report_sentiment: async (params: {
      sentiment: string;
      confidence?: number;
      indicators?: string[];
      recommendation?: string;
    }) => {
      console.log('🎭 Tool report_sentiment called:', params.sentiment, params);
      const newEntry: SentimentEntry = {
        id: ++sentimentIdRef.current,
        sentiment: (params.sentiment as SentimentEntry['sentiment']) || 'neutral',
        confidence: typeof params.confidence === 'number' ? params.confidence : 0.85,
        indicators: params.indicators || [],
        recommendation: params.recommendation || '',
        timestamp: new Date(),
      };
      setSentimentHistory(prev => [...prev, newEntry]);
      // Auto-scroll timeline
      setTimeout(() => {
        sentimentTimelineRef.current?.scrollTo({
          top: sentimentTimelineRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
      console.log('✅ Tool report_sentiment completed');
      return { ok: true };
    },
  });

  // Pre-fetch system prompt
  useEffect(() => {
    fetch('/prompts/treasury-agent-system-prompt.md')
      .then(res => res.ok ? res.text() : '')
      .then(text => { systemPromptRef.current = text; })
      .catch(err => console.warn('Prompt fetch error:', err));
  }, []);

  // Load ElevenLabs ConvAI widget and register client tools
  // Pattern follows the proven reference implementation exactly.
  useEffect(() => {
    // The handler that injects our client tools every time a call starts
    const onCallEvent = (event: any) => {
      console.log('🎯 elevenlabs-convai:call event fired — injecting client tools');

      // Inject client tools into the call config
      event.detail.config.clientTools = {
        report_sentiment: async (data: any) =>
          clientToolsRef.current.report_sentiment(data),
      };

      // Inject system prompt override if available (synchronously)
      if (systemPromptRef.current) {
        if (!event.detail.config.overrides) event.detail.config.overrides = {};
        if (!event.detail.config.overrides.agent) event.detail.config.overrides.agent = {};
        event.detail.config.overrides.agent.prompt = { prompt: systemPromptRef.current };
        console.log('📝 System prompt override injected');
      }

      console.log('✅ report_sentiment client tool injected');
    };

    // Helper to attach the listener to the widget element
    const attachToWidget = (widget: Element) => {
      if ((widget as any)._sentimentToolsAttached) return;

      (widget as any).addEventListener('elevenlabs-convai:call', onCallEvent);
      (widget as any)._sentimentToolsAttached = true;
      console.log('🔗 Attached elevenlabs-convai:call listener to widget');
    };

    // --- Path 1: Custom element already registered ---
    if (typeof customElements !== 'undefined' && customElements.get('elevenlabs-convai')) {
      console.log('🎙️ ElevenLabs custom element already defined');
      const widget = document.querySelector('elevenlabs-convai[agent-id="agent_2801khqsp034f7d8dr2qyehrazc9"]');
      if (widget) {
        attachToWidget(widget);
      }
    }

    // --- Path 2: Script tag present but element may not be ready ---
    const existingScript = document.querySelector(
      'script[src*="elevenlabs/convai-widget-embed"]'
    );
    if (existingScript) {
      console.log('🎙️ ElevenLabs script already loaded — waiting for widget');
      const check = setInterval(() => {
        const widget = document.querySelector('elevenlabs-convai[agent-id="agent_2801khqsp034f7d8dr2qyehrazc9"]');
        if (widget && !(widget as any)._sentimentToolsAttached) {
          console.log('🔗 Widget found — attaching event listener');
          clearInterval(check);
          attachToWidget(widget);
        }
      }, 200);
      const timeout = setTimeout(() => clearInterval(check), 8000);
      return () => { clearInterval(check); clearTimeout(timeout); };
    }

    // --- Path 3: Script not yet loaded — load it dynamically ---
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => {
      console.log('🎙️ ElevenLabs ConvAI script loaded — waiting for widget');
      const check = setInterval(() => {
        const widget = document.querySelector('elevenlabs-convai[agent-id="agent_2801khqsp034f7d8dr2qyehrazc9"]');
        if (widget) {
          console.log('🔗 Widget found — attaching event listener');
          clearInterval(check);
          attachToWidget(widget);
        }
      }, 200);
      setTimeout(() => clearInterval(check), 8000);
    };
    document.body.appendChild(script);

    return () => { };
  }, [currentView]);
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setData(prev => {
        // Add all remittances from the pool that don't already exist
        const newRemittances = NEW_REMITTANCES_POOL
          .filter(remittance => !prev.some(r => r.id === remittance.id))
          .map(remittance => ({ ...remittance, isNew: true }));

        // If all remittances from pool already exist, don't add duplicates
        if (newRemittances.length === 0) {
          return prev;
        }

        // Add all new remittances at once
        return [...newRemittances, ...prev];
      });
      setIsRefreshing(false);
      setTimeout(() => {
        setData(current => current.map(item => ({
          ...item,
          isNew: false
        })));
      }, 3000);
    }, 1200);
  }, [isRefreshing]);
  const handleRunAI = (remittanceId: string) => {
    setProcessingRowId(remittanceId);
    setData(prev => prev.map(item => item.id === remittanceId ? {
      ...item,
      status: 'Processing' as const
    } : item));
    setEmailSent(false); // Reset email sent state when starting new AI processing
    setTimeout(() => {
      setCurrentView('ai-processing');
      setCurrentStep(0);
    }, 300);
  };
  const handleNextStep = () => {
    const isLitware = processingRowId === '5';
    const isNorthwind = processingRowId === '4';
    const isBlueWave = processingRowId === '7';
    const isBankFee = processingRowId === '9';
    const isMisapplied = processingRowId === '10';
    const isRefund = processingRowId === '11';
    const currentSteps = isLitware ? AI_STEPS_EXTENDED : AI_STEPS_BASE;

    // Refund/DD/Write-Off has 9 steps (0-8); step 8 is Resolution Completed, no Next
    if (isRefund) {
      if (currentStep < 8) {
        setCurrentStep(prev => prev + 1);
      }
      return;
    }

    // Misapplied Cash has 9 steps (0-8); step 8 is Resolution Completed, no Next
    if (isMisapplied) {
      if (currentStep < 8) {
        setCurrentStep(prev => prev + 1);
      }
      return;
    }

    // Bank Fees has 9 steps (0-8); step 8 is Resolution Completed, no Next
    if (isBankFee) {
      if (currentStep < 8) {
        setCurrentStep(prev => prev + 1);
      }
      return;
    }
    // Nakamura Holdings and Castellan have 11 steps (0-10); step 10 is Resolution Completed, no Next
    if (isBlueWave || processingRowId === '8') {
      if (currentStep < 10) {
        setCurrentStep(prev => prev + 1);
      }
      return;
    }
    // Harlow Crane has 13 steps (0-12), then goes to success/dashboard
    if (isNorthwind) {
      if (currentStep < 12) {
        setCurrentStep(prev => prev + 1);
      } else {
        // After step 12, mark as posted and return to dashboard
        setData(prev => prev.map(item => item.id === processingRowId ? {
          ...item,
          status: 'Posted' as const,
          resolutionType: 'Touchless'
        } : item));
        setCurrentView('dashboard');
        setProcessingRowId(null);
      }
    } else if (currentStep < 4) {
      // For other flows, go through first 5 steps (indices 0-4)
      setCurrentStep(prev => prev + 1);
    } else {
      // After step 4, navigate to appropriate view
      if (processingRowId === '5') {
        setCurrentView('exception-workbench');
      } else {
        setCurrentView('posting');
      }
    }
  };
  const handlePrevStep = () => {
    if (currentView === 'ai-processing') {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      } else {
        setCurrentView('dashboard');
        setProcessingRowId(null);
      }
    } else if (currentView === 'exception-workbench') {
      const isNorthwind = processingRowId === '4';
      if (isNorthwind) {
        setCurrentView('ai-processing');
        setCurrentStep(4);
      } else {
        setCurrentView('ai-processing');
        setCurrentStep(4);
      }
    } else if (currentView === 'posting') {
      if (processingRowId === '5') {
        setCurrentView('exception-workbench');
      } else {
        setCurrentView('ai-processing');
        setCurrentStep(4);
      }
    }
  };
  const handleConfirmPost = () => {
    setCurrentView('posting');
  };
  const handlePostingComplete = () => {
    setCurrentView('success');
  };
  const handleBackToDashboard = () => {
    const isLitware = processingRowId === '5';
    setData(prev => prev.map(item => item.id === processingRowId ? {
      ...item,
      status: 'Posted' as const,
      resolutionType: isLitware ? 'Assisted' : 'Touchless'
    } : item));
    setKpis(prev => ({
      ...prev,
      touchlessRate: 85,
      failedToday: 40,
      autoResolved: isLitware ? 31 : 32
    }));
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
    setSelectedInvoice('KRL-INV-4432');
  };
  const Sidebar = () => <aside className="w-64 bg-[#00263A] border-r border-[#001F2E] flex flex-col flex-shrink-0">
    <div className="p-4">
      <div className="flex items-center gap-2 text-white mb-8">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
          <span className="text-[#00263A] font-black text-sm leading-none tracking-tight">K</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-white">Kroll</span>
          <span className="text-[10px] font-medium text-[#7AADCB] tracking-wide">Receivables Intelligence</span>
        </div>
      </div>

      <nav className="space-y-1">
        <p className="text-[10px] font-bold text-[#7AADCB] uppercase tracking-widest px-3 mb-2">Menu</p>
        <button onClick={() => setCurrentView('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'overview' ? 'bg-[#003354] text-white' : 'text-[#A8C8DB] hover:bg-[#003354]/70 hover:text-white'}`}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'dashboard' ? 'bg-[#003354] text-white' : 'text-[#A8C8DB] hover:bg-[#003354]/70 hover:text-white'}`}>
          <Inbox className="w-4 h-4 flex-shrink-0" />
          Cash Applications
        </button>
        <button onClick={() => setCurrentView('invoice-delivery')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'invoice-delivery' ? 'bg-[#003354] text-white' : 'text-[#A8C8DB] hover:bg-[#003354]/70 hover:text-white'}`}>
          <Upload className="w-4 h-4" />
          Invoice Delivery
        </button>
      </nav>
    </div>

    <div className="mt-auto p-6 border-t border-[#001F2E]">
      <div className="flex items-center gap-3 text-[#A8C8DB] hover:text-white transition-colors cursor-pointer mb-4">
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium">Region: Global</span>
      </div>
      <div className="flex items-center gap-3 p-2 bg-[#001F2E] rounded-lg">
        <div className="w-8 h-8 bg-[#003354] rounded-full flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">Alex Rivers</span>
          <span className="text-[10px] text-[#7AADCB]">Director, Receivables · Global Finance</span>
        </div>
      </div>
    </div>
  </aside>;
  const Header = () => {
    const getTitle = () => {
      switch (currentView) {
        case 'overview': return 'Dashboard';
        case 'dashboard': return 'Cash Applications';
        case 'call-analysis': return 'Call Analysis';
        case 'disputes': return 'Disputes';
        case 'ptp': return 'Promise to Pay';
        case 'customer-master': return 'Customer Master Data';
        case 'qa': return 'Quality Assurance';
        case 'invoice-delivery': return 'Invoice Delivery';
        case 'help': return 'Get Assistance';
        default: return 'Dashboard';
      }
    };

    return <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-800">{getTitle()}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Global search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-all" />
        </div>
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-slate-800 transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
            3
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Last sync: 10:42 AM</span>
        </div>
      </div>
    </header>;
  };
  const MainDashboardView = () => {
    const totalCashApplied = 480;
    const touchlessRate = kpis.touchlessRate;
    const failedApplications = kpis.failedToday;
    const autoResolved = kpis.autoResolved;
    const exceptionQueue = 24;
    const avgResolutionTime = 2.4;
    const totalCalls = 142;
    const positiveSentiment = 74;
    const avgQAScore = 81;
    const activeDisputes = 12;

    const cashAppliedTrend = [
      { day: 'Mon', amount: 320 },
      { day: 'Tue', amount: 410 },
      { day: 'Wed', amount: 380 },
      { day: 'Thu', amount: 450 },
      { day: 'Fri', amount: 480 },
    ];

    const resolutionTrend = [
      { day: 'Mon', resolved: 28 },
      { day: 'Tue', resolved: 35 },
      { day: 'Wed', resolved: 32 },
      { day: 'Thu', resolved: 38 },
      { day: 'Fri', resolved: 31 },
    ];

    const auditTrail = [
      { id: 1, message: '$125K applied — Aldridge Pharma Group · INV-3821', time: '2 min ago', icon: CheckCircle2, color: 'text-emerald-600' },
      { id: 2, message: 'Dispute escalated — Pinnacle Global · pricing discrepancy', time: '15 min ago', icon: AlertCircle, color: 'text-amber-600' },
      { id: 3, message: 'PTP commitment logged — Sterling Trust Bank · INV-20011', time: '32 min ago', icon: Calendar, color: 'text-[#00263A]' },
      { id: 4, message: 'QA review complete — 85/100 — Brightline Industries', time: '1 hr ago', icon: Shield, color: 'text-purple-600' },
      { id: 5, message: 'Call intelligence — positive sentiment — Meridian Capital', time: '2 hr ago', icon: PhoneCall, color: 'text-green-600' },
    ];

    return (
      <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-base font-semibold text-slate-800">Receivables Command Centre</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-semibold text-emerald-700">Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Kroll Receivables Intelligence · Global Finance Operations · Audit trail active</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">Alex Rivers</div>
            <div className="text-[10px] text-slate-400">Director, Receivables · Global Finance</div>
          </div>
        </div>

        {/* Kroll Platform Value Strip */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#00263A] rounded-lg text-white">
            <Brain className="w-4 h-4 text-[#7AADCB] flex-shrink-0" />
            <div>
              <div className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Probabilistic Intelligence</div>
              <div className="text-xs text-white/80">AI resolves remittance, email &amp; call signals end-to-end</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg">
            <Shield className="w-4 h-4 text-[#00263A] flex-shrink-0" />
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Deterministic Controls</div>
              <div className="text-xs text-slate-600">SoD, approval gates &amp; audit logging enforced by risk tier</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg">
            <Award className="w-4 h-4 text-[#00263A] flex-shrink-0" />
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Trusted Expertise</div>
              <div className="text-xs text-slate-600">Kroll advisory-grade framework · independent &amp; audit-ready</div>
            </div>
          </div>
        </div>

        {/* Primary KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Cash Applied Today</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#7AADCB]" />
            </div>
            <div className="text-2xl font-semibold tracking-tight mb-0.5">${totalCashApplied}M</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#7AADCB]">+12% vs. prior day</span>
              <span className="text-[10px] text-[#7AADCB]">·</span>
              <span className="text-[10px] text-[#7AADCB]">Audit-ready</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Touchless Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">{touchlessRate}%</div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[#00263A] rounded-full" style={{ width: `${touchlessRate}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Auto-applied without human review · Tier 2–3</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Open Exceptions</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-2xl font-semibold text-rose-600 tracking-tight mb-0.5">{failedApplications}</div>
            <span className="text-[10px] text-slate-400">Routed to analyst workbench · SLA tracked</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved by AI</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#00263A]" />
            </div>
            <div className="text-2xl font-semibold text-[#00263A] tracking-tight mb-0.5">{autoResolved}</div>
            <span className="text-[10px] text-slate-400">Closed end-to-end without escalation today</span>
          </div>
        </div>

        {/* Secondary Operational Metrics */}
        <div className="grid grid-cols-7 gap-3 mb-5">
          {[
            { label: 'Exception Queue', value: exceptionQueue, sub: 'items open' },
            { label: 'Avg Resolution', value: `${avgResolutionTime}m`, sub: 'cycle time' },
            { label: 'Error Rate', value: `${kpis.falseAutoPostRate}%`, sub: 'false postings' },
            { label: 'Unapplied Cash', value: '$3.2M', sub: 'unmatched' },
            { label: 'Calls Logged', value: totalCalls, sub: `${positiveSentiment}% positive` },
            { label: 'Active Disputes', value: activeDisputes, sub: 'in review' },
            { label: 'QA Score', value: `${avgQAScore}/100`, sub: 'avg this week' },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-sm font-semibold text-slate-800 leading-tight">{m.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts + Audit Trail */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-700">Applied Cash — 5-Day Trend</h3>
              <span className="text-[10px] text-slate-400">$M</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={cashAppliedTrend}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00263A" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#00263A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#00263A" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-700">Exceptions Resolved — Daily</h3>
              <span className="text-[10px] text-slate-400">count</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={resolutionTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="resolved" fill="#00263A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-700">Audit Trail</h3>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                live
              </span>
            </div>
            <div className="space-y-0.5">
              {auditTrail.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-2 py-1.5 px-1.5 hover:bg-slate-50 rounded transition-colors">
                    <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${item.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-700 font-medium leading-snug">{item.message}</p>
                      <p className="text-[10px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kroll End-to-End Workflow Navigation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">End-to-End Workflows</h3>
            <span className="text-[10px] text-slate-400">Kroll Receivables Intelligence · select a module</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                view: 'dashboard',
                icon: Inbox,
                label: 'Exception Workbench',
                sub: `${failedApplications} items pending analyst review`,
                tag: 'Cash Application',
                color: 'text-[#00263A]',
                tagBg: 'bg-slate-100 text-slate-600',
              },
              {
                view: 'call-analysis',
                icon: PhoneCall,
                label: 'Call Intelligence',
                sub: `${totalCalls} calls logged · ${positiveSentiment}% positive sentiment`,
                tag: 'Collections',
                color: 'text-emerald-700',
                tagBg: 'bg-emerald-50 text-emerald-700',
              },
              {
                view: 'disputes',
                icon: FileText,
                label: 'Dispute Resolution',
                sub: `${activeDisputes} active · SLA monitoring · evidence routing`,
                tag: 'Risk Advisory',
                color: 'text-amber-700',
                tagBg: 'bg-amber-50 text-amber-700',
              },
              {
                view: 'qa',
                icon: Shield,
                label: 'Quality Assurance',
                sub: `Avg ${avgQAScore}/100 · continuous audit · agent performance`,
                tag: 'Compliance',
                color: 'text-purple-700',
                tagBg: 'bg-purple-50 text-purple-700',
              },
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view as any)}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.tagBg}`}>{item.tag}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mb-1">{item.label}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed mb-2">{item.sub}</div>
                <div className={`flex items-center gap-1 text-[10px] font-semibold ${item.color}`}>
                  Open module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const getRiskTier = (confidence: number, amountStr?: string): { tier: string; label: string; color: string } => {
    // Simple demo mapping:
    // - Tier 2 (Controlled auto): very high confidence (≈95%+) where touchless posting is allowed
    // - Tier 1 (Draft): medium/high confidence where AI drafts plans, but humans send/post
    // - Tier 0 (Assist): low confidence or high-uncertainty cases needing full analyst control
    if (confidence >= 95) return { tier: 'Tier 2', label: 'Controlled auto', color: 'bg-emerald-100 text-emerald-800' };
    if (confidence >= 80) return { tier: 'Tier 1', label: 'Draft', color: 'bg-amber-100 text-amber-800' };
    return { tier: 'Tier 0', label: 'Assist', color: 'bg-slate-100 text-slate-700' };
  };

  const DashboardView = () => <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">

    {/* Page Header */}
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-base font-semibold text-slate-800">Cash Applications</h1>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-full">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-rose-700">{kpis.failedToday} Requiring Attention</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">Kroll Receivables Intelligence · Engagement-based receivables · D365 / SAP Ariba · Audit trail active</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Alex Rivers</div>
          <div className="text-[10px] text-slate-400">Director, Receivables · Global Finance</div>
        </div>
      </div>
    </div>

    {/* Primary KPIs — 4-col grid */}
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="bg-[#00263A] rounded-lg p-4 text-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Cash Applied Today</span>
          <TrendingUp className="w-3.5 h-3.5 text-[#7AADCB]" />
        </div>
        <div className="text-2xl font-semibold tracking-tight mb-0.5">$18.4M</div>
        <div className="text-[10px] text-[#7AADCB]">+8% vs. prior day · Audit-ready</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Touchless Rate</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-2xl font-semibold text-emerald-600 tracking-tight mb-1">{kpis.touchlessRate}%</div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpis.touchlessRate}%` }} />
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Auto-applied without human review</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Open Exceptions</span>
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        </div>
        <div className="text-2xl font-semibold text-rose-600 tracking-tight mb-0.5">{kpis.failedToday}</div>
        <div className="text-[10px] text-slate-400">Routed to analyst workbench · SLA tracked</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved by AI</span>
          <CheckCircle className="w-3.5 h-3.5 text-[#00263A]" />
        </div>
        <div className="text-2xl font-semibold text-[#00263A] tracking-tight mb-0.5">{kpis.autoResolved}</div>
        <div className="text-[10px] text-slate-400">Closed end-to-end without escalation today</div>
      </div>
    </div>

    {/* Secondary Operational Metrics — 4-col grid */}
    <div className="grid grid-cols-4 gap-3 mb-5">
      {[
        { label: 'Exception Queue', value: '24', sub: 'items open' },
        { label: 'Cycle Time', value: `${kpis.exceptionCycleTimeMins}m`, sub: 'avg resolution' },
        { label: 'False Post Rate', value: `${kpis.falseAutoPostRate}%`, sub: 'false auto-postings' },
        { label: 'Unapplied Cash', value: '$3.2M', sub: 'unmatched · at risk' },
      ].map((m) => (
        <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{m.label}</div>
          <div className="text-sm font-semibold text-slate-800 leading-tight">{m.value}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
        </div>
      ))}
    </div>

    {/* Queue Table Header */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-xs font-semibold text-slate-700">Exception Queue — Requiring Analyst Review</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Multi-matter allocation · cross-border withholding · intermediary-fee shortfalls · DSO impact tracked</p>
      </div>
      <button onClick={handleRefresh} disabled={isRefreshing} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${isRefreshing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95'}`}>
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Queue'}
      </button>
    </div>

    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email ID</th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI Confidence
            </th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
            <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <AnimatePresence initial={false}>
            {data.map(row => <motion.tr key={row.id} initial={row.isNew ? {
              opacity: 0,
              x: -20,
              backgroundColor: '#f0f9ff'
            } : false} animate={{
              opacity: 1,
              x: 0,
              backgroundColor: row.isNew ? '#f0f9ff' : '#ffffff'
            }} transition={{
              duration: 0.5
            }} className={`group hover:bg-slate-50 transition-colors ${row.status === 'Processing' ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                <div className="flex items-center gap-2">
                  {row.emailId}
                  {row.isNew && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                    New
                  </span>}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{row.customer}</td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-800">{row.amount}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{row.region}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{
                      width: `${row.confidence}%`
                    }} />
                  </div>
                  <span className={`text-xs font-bold ${row.confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {row.confidence}%
                  </span>
                </div>
                {row.status === 'Ready' && <div className={`text-[10px] mt-1 font-medium ${row.confidence > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {row.confidence > 90 ? 'High confidence' : 'Needs review'}
                </div>}
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">{row.age}</td>
              <td className="px-4 py-3">
                {row.status === 'Failed' ? <div className="flex items-center gap-2 text-rose-600 text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  <span>Failed</span>
                </div> : row.status === 'Processing' ? <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Processing...</span>
                </div> : row.status === 'Posted' ? <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{row.resolutionType === 'Resolved by AI' ? 'Resolved by AI' : row.resolutionType === 'Awaiting Documentation' ? 'Awaiting Documentation' : 'Posted'}</span>
                </div> : <button onClick={() => handleRunAI(row.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00263A] text-white rounded-lg text-xs font-bold hover:bg-[#003354] transition-colors shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Run AI Resolution
                </button>}
              </td>
            </motion.tr>)}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  </div>;
  const handleBlueWaveApproveAndPost = () => {
    setData(prev => prev.map(item => item.id === '7' ? { ...item, status: 'Posted' as const, resolutionType: 'Resolved by AI' } : item));
    setKpis(prev => ({ ...prev, autoResolved: 32 }));
    setCurrentStep(10);
  };
  const handleBlueWaveBackToDashboard = () => {
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
  };
  const handleNihonApproveAndPost = () => {
    setData(prev => prev.map(item => item.id === '8' ? { ...item, status: 'Posted' as const, resolutionType: 'Awaiting Documentation' } : item));
    setKpis(prev => ({ ...prev, autoResolved: prev.autoResolved + 1 }));
    setCurrentStep(10);
  };
  const handleNihonBackToDashboard = () => {
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
  };
  const handleBankFeeApproveAndPost = () => {
    setData(prev => prev.map(item => item.id === '9' ? { ...item, status: 'Posted' as const, resolutionType: 'Resolved by AI' } : item));
    setCurrentStep(8);
  };
  const handleBankFeeBackToDashboard = () => {
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
  };
  const handleMisappliedApproveAndPost = () => {
    setData(prev => prev.map(item => item.id === '10' ? { ...item, status: 'Posted' as const, resolutionType: 'Corrected' } : item));
    setCurrentStep(7);
  };
  const handleMisappliedBackToDashboard = () => {
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
  };
  const handleRefundApproveAndPost = () => {
    setData(prev => prev.map(item => item.id === '11' ? { ...item, status: 'Posted' as const, resolutionType: 'Refunded' } : item));
    setCurrentStep(7);
  };
  const handleRefundBackToDashboard = () => {
    setCurrentView('dashboard');
    setProcessingRowId(null);
    setCurrentStep(0);
  };
  const AIProcessingView = () => {
    const isLitware = processingRowId === '5';
    const isNorthwind = processingRowId === '4';
    const isBlueWave = processingRowId === '7';
    const isNihon = processingRowId === '8';
    const isBankFee = processingRowId === '9';
    const isMisapplied = processingRowId === '10';
    const isRefund = processingRowId === '11';
    const currentSteps = isRefund ? AI_STEPS_REFUND : (isMisapplied ? AI_STEPS_MISAPPLIED : (isBankFee ? AI_STEPS_BANKFEE : (isNihon ? AI_STEPS_NIHON : (isBlueWave ? AI_STEPS_BLUEWAVE : (isNorthwind ? AI_STEPS_NORTHWIND : (isLitware ? AI_STEPS_EXTENDED : AI_STEPS_BASE))))));
    const activeStep = currentSteps[currentStep];

    // Refund/DD/Write-Off: custom detailed screens for steps 2–9 (indices 1–8)
    if (isRefund && currentStep >= 1) {
      return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
        {/* Horizontal Stepper */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {currentSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const label = step.title.replace(/\s+/, '\n');
                return <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white ring-2 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 whitespace-pre-line ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {label}
                    </span>
                    {STEP_AGENT_MAP[step.title] && (
                      <span className="text-[8px] text-slate-400 text-center mt-0.5 px-0.5 truncate w-full" title={STEP_AGENT_MAP[step.title]}>
                        {STEP_AGENT_MAP[step.title]}
                      </span>
                    )}
                  </div>
                  {index < currentSteps.length - 1 && <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
                    <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>}
                </React.Fragment>;
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {currentStep === 1 && (
            /* Step 2 — Overpayment Detection */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Overpayment Detection</h2>
                  <p className="text-sm text-slate-600">The Match & Reconciliation Agent cross-checks the collected amount against the invoice.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Used</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Field</th>
                            <th className="pb-2 text-left">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="py-2 text-slate-500">Invoice</td><td className="py-2 font-semibold text-slate-900">KRL-INV-4970 — $80,000</td></tr>
                          <tr><td className="py-2 text-slate-500">Collected via direct debit</td><td className="py-2 font-semibold text-slate-900">$80,250 (SEPA-DD-KRL-0098)</td></tr>
                          <tr><td className="py-2 text-slate-500">Variance</td><td className="py-2 font-semibold text-amber-600">+$250 overpayment</td></tr>
                          <tr><td className="py-2 text-slate-500">Invoice status after $80,000 applied</td><td className="py-2 font-semibold text-emerald-600">Settled</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Conclusion</h3>
                    <p className="text-sm text-blue-800">Direct-debit collection exceeded the invoice by $250. Invoice can be cleared; the $250 residual credit must be refunded or written off per policy.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 2 && (
            /* Step 3 — Policy & Threshold Check */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Policy & Threshold Check</h2>
                  <p className="text-sm text-slate-600">The Kroll Case Resolution agent applies the approval matrix to the $250 residual.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approval Policy</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Rule</th>
                            <th className="pb-2 text-left">Threshold</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="py-2 text-slate-700">Auto write-off (immaterial)</td><td className="py-2 font-semibold text-slate-900">≤ $75</td></tr>
                          <tr><td className="py-2 text-slate-700">Refund — analyst prepares</td><td className="py-2 font-semibold text-slate-900">Any</td></tr>
                          <tr><td className="py-2 text-slate-700">Refund — manager approval required</td><td className="py-2 font-semibold text-amber-700">&gt; $100</td></tr>
                          <tr><td className="py-2 text-slate-700">Refund disbursement executed by</td><td className="py-2 font-semibold text-slate-900">Treasury</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Reasoning</h3>
                    <p className="text-sm text-blue-800">$250 residual. $50 falls under the $75 immaterial write-off threshold → eligible for write-off. Remaining $200 exceeds the $100 refund threshold → manager approval required before Treasury disburses.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 3 && (
            /* Step 4 — Resolution Split */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Resolution Split — Refund vs Write-Off</h2>
                  <p className="text-sm text-slate-600">The AI Decision Engine splits the $250 residual according to policy thresholds.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Split Decision</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Portion</th>
                            <th className="pb-2 text-left">Amount</th>
                            <th className="pb-2 text-left">Treatment</th>
                            <th className="pb-2 text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-blue-50">
                            <td className="py-2 font-semibold text-blue-700">Refund</td>
                            <td className="py-2 font-semibold text-blue-700">$200</td>
                            <td className="py-2 text-slate-700">Return to customer</td>
                            <td className="py-2 text-slate-600 text-xs">Above immaterial threshold; customer funds</td>
                          </tr>
                          <tr className="bg-amber-50">
                            <td className="py-2 font-semibold text-amber-700">Write-off</td>
                            <td className="py-2 font-semibold text-amber-700">$50</td>
                            <td className="py-2 text-slate-700">Write off residual</td>
                            <td className="py-2 text-slate-600 text-xs">Below $75 immaterial threshold</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Why split it?</h3>
                    <p className="text-sm text-blue-800">Refunding the full $250 incurs disproportionate processing cost for a $50 tail. Policy permits writing off the immaterial $50 and refunding the material $200.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 4 && (
            /* Step 5 — AI Decision / Resolution Strategy */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">AI Decision — Resolution Strategy</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Conclusion</h3>
                    <p className="text-sm text-blue-800">Clear KRL-INV-4970, refund $200 to the customer's bank on file, write off $50 as immaterial. Route refund for manager approval.</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Resolution Strategy</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Action</th>
                            <th className="pb-2 text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="py-2 font-semibold text-slate-900">Apply $80,000 to KRL-INV-4970</td><td className="py-2 text-slate-700">Settle the invoice</td></tr>
                          <tr><td className="py-2 font-semibold text-slate-900">Refund $200 to customer</td><td className="py-2 text-slate-700">Material overpayment, customer funds</td></tr>
                          <tr><td className="py-2 font-semibold text-slate-900">Write off $50 (WO_IMMATERIAL)</td><td className="py-2 text-slate-700">Below $75 threshold</td></tr>
                          <tr><td className="py-2 font-semibold text-slate-900">Link all docs for audit</td><td className="py-2 text-slate-700">Complete audit trail (SLA 2.2.5)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 5 && (
            /* Step 6 — Refund & Write-Off Posting Proposal */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Refund & Write-Off Posting Proposal</h2>
                  <p className="text-sm text-slate-600">The D365 Posting Agent prepares the journal entry and refund disbursement request.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Posting Recommendation</h3>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                      <li>Settle invoice KRL-INV-4970 with $80,000 from direct debit collection</li>
                      <li>Create refund payable of $200 due back to Calderwood Advisory Group</li>
                      <li>Write off $50 residual (reason code WO_IMMATERIAL)</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Proposed Journal Entry</h3>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-2 text-slate-800 bg-slate-50">
                      <p>Dr Accounts Receivable        $80,000   (clear KRL-INV-4970)</p>
                      <p>Dr Refund Payable             $200      (due back to customer)</p>
                      <p>Dr Write-Off Expense          $50       (reason WO_IMMATERIAL)</p>
                      <p>Cr Cash (direct debit)        $80,250</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">System Actions if Approved</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Mark KRL-INV-4970 Settled in D365</li>
                      <li>Create refund disbursement request to Treasury for $200 (customer bank on file)</li>
                      <li>Post $50 write-off with reason code WO_IMMATERIAL</li>
                      <li>Link refund + write-off docs to the original direct-debit receipt for audit</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 6 && (
            /* Step 7 — Human Review / Approval Matrix */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Human Review / Approval Matrix</h2>
                  <p className="text-sm text-slate-600">This resolution requires manager authorization before posting.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">AI Resolution Summary</h3>
                    <p className="text-sm text-slate-700">Overpayment via direct debit. Invoice settled. $200 refund (manager approval required, Treasury disburses) + $50 immaterial write-off.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approval Routing</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Item</th>
                            <th className="pb-2 text-left">Amount</th>
                            <th className="pb-2 text-left">Approval</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 text-slate-700">Write-off</td>
                            <td className="py-2 font-semibold text-slate-900">$50</td>
                            <td className="py-2 font-semibold text-emerald-600">Auto-approved (under threshold)</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-700">Refund</td>
                            <td className="py-2 font-semibold text-slate-900">$200</td>
                            <td className="py-2 font-semibold text-amber-600">Requires manager approval</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-700">Disbursement</td>
                            <td className="py-2 font-semibold text-slate-900">$200</td>
                            <td className="py-2 font-semibold text-blue-600">Treasury</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Options</h3>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleRefundApproveAndPost} className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-bold hover:bg-[#003354] transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Post to D365
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4" />
                        Create Journal Draft
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject Recommendation
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">Refunds above the policy threshold require manager authorization; disbursement is executed by Treasury, separate from posting.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 7 && (
            /* Step 8 — Posting Execution */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto text-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <h2 className="text-sm font-semibold text-slate-800">Posting to D365</h2>
                  <div className="space-y-2 text-sm text-slate-700 text-left max-w-sm mx-auto">
                    <p>• Settling KRL-INV-4970…</p>
                    <p>• Posting $50 write-off (WO_IMMATERIAL)…</p>
                    <p>• Creating $200 refund request to Treasury…</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Posting Summary</h3>
                    <p className="text-xs text-slate-600 mb-1">Case: REM_011 — Calderwood Advisory</p>
                    <p className="text-xs text-slate-600 mb-1">Invoice Settled: KRL-INV-4970</p>
                    <p className="text-xs text-slate-600 mb-1">Refund $200 → Treasury queue</p>
                    <p className="text-xs text-slate-600">Write-off $50 posted (WO_IMMATERIAL)</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 8 && (
            /* Step 9 — Resolution Completed */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto space-y-4 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">Resolution Completed</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-left max-w-sm mx-auto">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800">Resolution Summary</h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-600">KRL-INV-4970</span><span className="font-semibold text-emerald-700">Settled</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Refund $200</span><span className="font-semibold text-slate-900">Submitted to Treasury</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Write-off $50</span><span className="font-semibold text-slate-900">Posted (WO_IMMATERIAL)</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Audit chain (refund + write-off + DD receipt)</span><span className="font-semibold text-slate-900">Linked</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Resolution Type</span><span className="font-semibold text-emerald-700">Refunded</span></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">Overpayment resolved — refund authorized, residual written off, full audit trail recorded.</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Dashboard Update</p>
                    <p className="text-sm text-blue-800">REM_011 — Calderwood Advisory will appear in Cash Applications as <span className="font-semibold">Refunded</span>. Refund $200 is pending Treasury disbursement.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer for Refund/DD/Write-Off */}
        <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
          {currentStep === 8 ? (
            <button onClick={handleRefundBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Cash Applications
            </button>
          ) : currentStep === 6 ? (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleRefundApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                <CheckCircle2 className="w-4 h-4" />
                Approve &amp; Post to D365
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <FileText className="w-4 h-4" />
                Create Journal Draft
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <XCircle className="w-4 h-4" />
                Reject Recommendation
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </motion.div>;
    }

    // Misapplied Cash: show custom detailed screens for steps 2–9 (indices 1–8)
    if (isMisapplied && currentStep >= 1) {
      return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
        {/* Horizontal Stepper - Compact */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {currentSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const label = step.title.replace(/\s+/, '\n');
                return <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white ring-2 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 whitespace-pre-line ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {label}
                    </span>
                    {STEP_AGENT_MAP[step.title] && (
                      <span className="text-[8px] text-slate-400 text-center mt-0.5 px-0.5 truncate w-full" title={STEP_AGENT_MAP[step.title]}>
                        {STEP_AGENT_MAP[step.title]}
                      </span>
                    )}
                  </div>
                  {index < currentSteps.length - 1 && <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
                    <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>}
                </React.Fragment>;
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area for Misapplied Cash steps 2–9 */}
        <div className="flex-1 overflow-hidden relative">
          {currentStep === 1 && (
            /* Misapplied Step 2 — Misapplication Detection */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Misapplication Detection</h2>
                  <p className="text-sm text-slate-600">The Match & Reconciliation Agent cross-checks the targeted invoice against the payment ledger.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Used</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Field</th>
                            <th className="pb-2 text-left">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 text-slate-500">Targeted invoice</td>
                            <td className="py-2 font-semibold text-slate-900">KRL-INV-4901</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-500">Invoice status</td>
                            <td className="py-2 font-semibold text-rose-600">Settled (paid 12 days ago)</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-500">Prior payment</td>
                            <td className="py-2 font-semibold text-slate-900">$125,000 on May 24, 2026</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-500">This payment</td>
                            <td className="py-2 font-semibold text-rose-600">Duplicate hit — invoice already closed</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Conclusion</h3>
                    <p className="text-sm text-blue-800">
                      This payment cannot belong to KRL-INV-4901; that invoice is already settled. Cash is misapplied. Investigating correct allocation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 2 && (
            /* Misapplied Step 3 — Customer Disambiguation */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Customer Disambiguation</h2>
                  <p className="text-sm text-slate-600">The Payment Matching Agent identifies the correct customer record via fuzzy name matching and routing analysis.</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Incorrect customer allocation detected</p>
                      <p className="text-xs text-amber-800 mt-0.5">Auto-match selected the wrong customer record due to a near-identical name collision.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fuzzy Match Results</h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Customer</th>
                            <th className="pb-2 text-left">ID</th>
                            <th className="pb-2 text-left">Region</th>
                            <th className="pb-2 text-left">Open Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-rose-50">
                            <td className="py-2 font-semibold text-rose-700">Harborview Partners LLP</td>
                            <td className="py-2 text-slate-600 font-mono text-xs">CL-2025-0112</td>
                            <td className="py-2 text-slate-600">NA</td>
                            <td className="py-2 font-semibold text-rose-700">$0 (all settled)</td>
                          </tr>
                          <tr className="bg-emerald-50">
                            <td className="py-2 font-semibold text-emerald-700">Harborview Partners (APAC) Pte Ltd</td>
                            <td className="py-2 text-slate-600 font-mono text-xs">CL-2025-0119</td>
                            <td className="py-2 text-slate-600">APAC</td>
                            <td className="py-2 font-semibold text-emerald-700">$125,000 open</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Reasoning</h3>
                    <p className="text-sm text-blue-800">
                      Bank routing detail and remittance memo map to the APAC entity (CL-2025-0119), which has an open invoice matching this amount. Original auto-match picked the wrong customer record due to a name collision. This is an incorrect customer allocation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 3 && (
            /* Misapplied Step 4 — Open Invoice Match */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Open Invoice Match — True Owner</h2>
                  <p className="text-sm text-slate-600">The Payment Matching Agent scans open invoices for Harborview Partners (APAC) Pte Ltd (CL-2025-0119).</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">APAC Entity — Open Invoices</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Invoice</th>
                            <th className="pb-2 text-left">Amount</th>
                            <th className="pb-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 text-slate-600 font-mono text-xs">KRL-INV-4917</td>
                            <td className="py-2 text-slate-600">$88,000</td>
                            <td className="py-2 text-slate-500">Open</td>
                          </tr>
                          <tr className="bg-emerald-50 ring-1 ring-emerald-300 ring-inset">
                            <td className="py-2 font-bold text-emerald-700 font-mono text-xs">KRL-INV-4933</td>
                            <td className="py-2 font-bold text-emerald-700">$125,000</td>
                            <td className="py-2 font-bold text-emerald-700">Open ✓</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-slate-600 font-mono text-xs">KRL-INV-4941</td>
                            <td className="py-2 text-slate-600">$42,500</td>
                            <td className="py-2 text-slate-500">Open</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Customer Match', pct: 100 },
                      { label: 'Invoice Match', pct: 98 },
                      { label: 'Amount Match', pct: 100 },
                    ].map(({ label, pct }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                          <span className="text-xs font-bold text-emerald-600">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-semibold">Correct open item identified. Recommend reverse-and-reapply.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 4 && (
            /* Misapplied Step 5 — AI Decision / Resolution Strategy */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">AI Decision — Resolution Strategy</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Conclusion</h3>
                    <p className="text-sm text-blue-800">
                      Misapplied cash. Reverse the application on the settled invoice and re-apply to the correct customer's open invoice.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Resolution Strategy</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Action</th>
                            <th className="pb-2 text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Reverse application on KRL-INV-4901</td>
                            <td className="py-2 text-slate-700">Invoice already settled; duplicate application</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Re-apply $125,000 to KRL-INV-4933</td>
                            <td className="py-2 text-slate-700">Correct customer (APAC) and matching open item</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Link reversal + reapply for audit</td>
                            <td className="py-2 text-slate-700">Full documentation of correction (SLA 2.2.4)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 5 && (
            /* Misapplied Step 6 — Correction Posting Proposal */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Correction Posting Proposal</h2>
                  <p className="text-sm text-slate-600">The D365 Posting Agent prepares the reversal and reapplication documents.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Posting Recommendation</h3>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                      <li>Reverse $125,000 application from KRL-INV-4901 (reopen nothing; it stays settled by its original payment)</li>
                      <li>Apply $125,000 to KRL-INV-4933 (customer CL-2025-0119)</li>
                      <li>Net cash movement: $0 — reclassification only</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Proposed Document Chain</h3>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-2 text-slate-800 bg-slate-50">
                      <p>Reversal Doc   KRL-DOC-REV-5510   Un-apply $125,000 from KRL-INV-4901</p>
                      <p>Reapply Doc    KRL-DOC-APP-5511   Apply  $125,000 to KRL-INV-4933</p>
                      <p>Reason codes   MISAPPLIED_REVERSAL · REAPPLY_CORRECT_CUST</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">System Actions if Approved</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Un-apply $125,000 from KRL-INV-4901</li>
                      <li>Apply $125,000 to KRL-INV-4933</li>
                      <li>Link both docs to original cash receipt for audit</li>
                      <li>Update both customers' AR balances</li>
                      <li>Mark KRL-INV-4933 Settled</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 6 && (
            /* Misapplied Step 7 — Human Review */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Human Review (Before Posting)</h2>
                  <p className="text-sm text-slate-600">Since this affects financial records, the system requires human approval before posting.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">AI Resolution Summary</h3>
                    <p className="text-sm text-slate-700">Misapplied cash identified. Duplicate application on a settled invoice; correct owner is the APAC entity. Reverse-and-reapply prepared.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Panel</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Evidence</th>
                            <th className="pb-2 text-left">Detail</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="py-2 text-slate-700">Settled-invoice flag</td><td className="py-2 font-semibold text-rose-600">KRL-INV-4901 already paid 12 days ago</td></tr>
                          <tr><td className="py-2 text-slate-700">Customer collision</td><td className="py-2 font-semibold text-slate-900">Name collision between two Harborview entities</td></tr>
                          <tr><td className="py-2 text-slate-700">True open item</td><td className="py-2 font-semibold text-emerald-700">KRL-INV-4933 — $125,000 open (APAC entity)</td></tr>
                          <tr><td className="py-2 text-slate-700">Net cash impact</td><td className="py-2 font-semibold text-slate-900">$0 — reclassification only</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Options</h3>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleMisappliedApproveAndPost} className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-bold hover:bg-[#003354] transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Post to D365
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4" />
                        Create Journal Draft
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject Recommendation
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">
                      Reversals that change customer balances require explicit human approval before posting.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 7 && (
            /* Misapplied Step 8 — Posting Execution */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto text-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <h2 className="text-sm font-semibold text-slate-800">Posting to D365</h2>
                  <div className="space-y-2 text-sm text-slate-700 text-left max-w-sm mx-auto">
                    <p>• Reversing application on KRL-INV-4901…</p>
                    <p>• Re-applying $125,000 to KRL-INV-4933…</p>
                    <p>• Updating both customer AR balances…</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Posting Summary</h3>
                    <p className="text-xs text-slate-600 mb-1">Case: REM_010 — Harborview Partners</p>
                    <p className="text-xs text-slate-600 mb-1">From: KRL-INV-4901 → To: KRL-INV-4933</p>
                    <p className="text-xs text-slate-600">Docs: REV-5510 / APP-5511</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 8 && (
            /* Misapplied Step 9 — Resolution Completed */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto space-y-4 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">Resolution Completed</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-left max-w-sm mx-auto">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800">Resolution Summary</h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-600">KRL-INV-4901</span><span className="font-semibold text-slate-900">Application reversed</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">KRL-INV-4933</span><span className="font-semibold text-emerald-700">Settled</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Both customer balances</span><span className="font-semibold text-slate-900">Corrected</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Audit chain (reversal + reapply)</span><span className="font-semibold text-slate-900">Linked</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Net cash impact</span><span className="font-semibold text-slate-900">$0</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Resolution Type</span><span className="font-semibold text-emerald-700">Corrected</span></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">Misapplied cash corrected — full audit trail recorded.</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Dashboard Update</p>
                    <p className="text-sm text-blue-800">
                      REM_010 — Harborview Partners will appear in Cash Applications as <span className="font-semibold">Corrected</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer for Misapplied Cash */}
        <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
          {currentStep === 8 ? (
            <button onClick={handleMisappliedBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Cash Applications
            </button>
          ) : currentStep === 6 ? (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleMisappliedApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                <CheckCircle2 className="w-4 h-4" />
                Approve &amp; Post to D365
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <FileText className="w-4 h-4" />
                Create Journal Draft
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <XCircle className="w-4 h-4" />
                Reject Recommendation
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </motion.div>;
    }

    // Castellan: show custom detailed screens for steps 6–11 (indices 5–10)
    if (isNihon && currentStep >= 5) {
      return <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
        {/* Horizontal Stepper - Compact */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {currentSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const label = step.title.replace(/\s+/, '\n');
                return <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white ring-2 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 whitespace-pre-line ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {label}
                    </span>
                    {STEP_AGENT_MAP[step.title] && (
                      <span className="text-[8px] text-slate-400 text-center mt-0.5 px-0.5 truncate w-full" title={STEP_AGENT_MAP[step.title]}>
                        {STEP_AGENT_MAP[step.title]}
                      </span>
                    )}
                  </div>
                  {index < currentSteps.length - 1 && <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
                    <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>}
                </React.Fragment>;
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area for Castellan steps 6–11 */}
        <div className="flex-1 overflow-hidden relative">
          {currentStep === 5 && (
            /* Castellan Screen 6 — Agentic Resolution Analysis */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Agentic Resolution Analysis</h2>
                  <p className="text-sm text-slate-600">The AI Resolution Agent consolidates evidence from all previous steps.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Used</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { source: 'Remittance', finding: 'Withholding tax applied' },
                            { source: 'Payment variance', finding: '30% deduction' },
                            { source: 'Customer tax profile', finding: 'Treaty eligible' },
                            { source: 'Documentation', finding: 'W-8BEN-E expired' }
                          ].map((row, idx) => (
                            <tr key={idx}>
                              <td className="py-2 pr-4 text-slate-500">{row.source}</td>
                              <td className="py-2 font-semibold text-slate-900">{row.finding}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI Conclusion</h3>
                    <p className="text-sm text-blue-800">
                      Short payment classified as withholding deduction. Customer applied default NRA withholding rate (30%) instead of the 10% treaty rate.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Resolution Strategy</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Action</th>
                            <th className="pb-2 text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Clear invoice</td>
                            <td className="py-2 text-slate-700">Payment identified and matched to KRL-INV-4863.</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Record withholding receivable</td>
                            <td className="py-2 text-slate-700">Deduction of $15,000 taken by customer as tax withholding.</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-slate-900">Request updated W-8</td>
                            <td className="py-2 text-slate-700">Documentation expired; updated W-8BEN-E required to validate treaty rate.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 6 && (
            /* Castellan Screen 7 — Customer Communication Draft */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Customer Communication Draft</h2>
                  <p className="text-sm text-slate-600">The Customer Outreach Agent prepares a message requesting documentation.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Generated Email</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Subject</p>
                        <p className="text-sm font-medium text-slate-900">Documentation required – withholding deduction (Invoice KRL-INV-4863)</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-line">
                        {`Hello Castellan Restructuring Ltd — Finance Team,

We received your payment of $35,000 against invoice KRL-INV-4863 totaling $50,000.

Your remittance indicates a withholding deduction of $15,000.

Based on treaty provisions between the US and Japan, the applicable withholding rate may be reduced if valid W-8BEN-E documentation is available.

Could you please provide:

• Updated W-8BEN-E
• Withholding calculation details
• Confirmation of the applied withholding rate

Thank you.`}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Why this email?</h3>
                    <p className="text-sm text-blue-800">
                      This communication requests documentation and calculation details so that any over-withholding can be corrected in line with treaty rules.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3">
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-bold hover:bg-[#003354] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Email
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                      <X className="w-4 h-4" />
                      Skip Communication
                    </button>
                    <p className="text-xs text-slate-600 w-full">
                      On send, the system auto-creates a D365 work item for tracking and audit evidence.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 7 && (
            /* Castellan Screen 8 — Accounting Posting Proposal */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Accounting Posting Proposal</h2>
                  <p className="text-sm text-slate-600">The D365 Posting Agent prepares the accounting resolution.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Posting Recommendation (Conservative)</h3>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                      <li>Clear invoice using net payment of $35,000.</li>
                      <li>Record $5,000 as expected withholding tax receivable.</li>
                      <li>Park the remaining $10,000 variance in a Short Pay Dispute/Suspense account.</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Proposed Journal Entry</h3>
                    </div>
                    <div className="p-4 font-mono text-sm space-y-2 text-slate-800">
                      <p>Dr Cash                          $35,000</p>
                      <p>Dr Withholding Tax Receivable     $5,000</p>
                      <p>Dr Short Pay Dispute/Suspense    $10,000</p>
                      <p>Cr Accounts Receivable           $50,000</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">System Actions if Approved</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Apply payment to invoice KRL-INV-4863.</li>
                      <li>Record deduction using reason code <span className="font-mono">WHT_US</span>.</li>
                      <li>Mark invoice as Settled in D365.</li>
                      <li>Create follow-up task to track receipt of withholding documentation.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 8 && (
            /* Castellan Screen 9 — Human Review (Before Posting) */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Human Review (Before Posting)</h2>
                  <p className="text-sm text-slate-600">Since this affects financial records, the system requires human approval before posting.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">AI Resolution Summary</h3>
                    <p className="text-sm text-slate-700">AI Investigation Complete.</p>
                    <p className="text-sm text-slate-700 mt-2">Reason for short payment: <span className="font-semibold">Combination of expected withholding and unexplained variance</span></p>
                    <p className="text-sm text-slate-700">Expected withholding (10% treaty rate): <span className="font-semibold">$5,000</span> · Remaining variance parked to dispute/suspense: <span className="font-semibold">$10,000</span></p>
                    <p className="text-sm text-slate-700">Customer documentation status: <span className="font-semibold">W-8BEN-E expired</span></p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evidence Panel</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 text-left">Evidence</th>
                            <th className="pb-2 text-left">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="py-2 text-slate-700">Remittance evidence</td><td className="py-2 font-semibold text-slate-900">Invoice $50,000 · Payment $35,000 · Total variance $15,000</td></tr>
                          <tr><td className="py-2 text-slate-700">Expected treaty withholding (10%)</td><td className="py-2 font-semibold text-slate-900">$5,000</td></tr>
                          <tr><td className="py-2 text-slate-700">Variance parked to dispute/suspense</td><td className="py-2 font-semibold text-slate-900">$10,000</td></tr>
                          <tr><td className="py-2 text-slate-700">W-8 status</td><td className="py-2 font-semibold text-rose-600">Expired</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Options</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-bold hover:bg-[#003354] transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Post to D365
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4" />
                        Create Journal Draft
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Reject Recommendation
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">
                      Posting will only proceed after explicit human approval.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 9 && (
            /* Castellan Screen 10 — Posting Execution */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto text-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <h2 className="text-sm font-semibold text-slate-800">Posting to D365</h2>
                  <div className="space-y-2 text-sm text-slate-700 text-left max-w-sm mx-auto">
                    <p>• Applying payment to invoice KRL-INV-4863…</p>
                    <p>• Posting withholding receivable of $15,000…</p>
                    <p>• Updating AR ledger balances…</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Posting Summary</h3>
                    <p className="text-xs text-slate-600 mb-1">Case: REM_008 — Castellan Restructuring Ltd</p>
                    <p className="text-xs text-slate-600 mb-1">Invoice: KRL-INV-4863</p>
                    <p className="text-xs text-slate-600">Journal: Dr Cash 35k / Dr WHT Rec 15k / Cr AR 50k</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 10 && (
            /* Castellan Screen 11 — Resolution Completed */
            <div className="h-full flex flex-row">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
                <div className="max-w-xl mx-auto space-y-4 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">AI Resolution Completed</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-left max-w-sm mx-auto">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800">Resolution Summary</h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-600">Invoice</span><span className="font-semibold text-slate-900">Settled</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Cash Applied</span><span className="font-semibold text-slate-900">$35,000</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Withholding Receivable (expected)</span><span className="font-semibold text-slate-900">$5,000</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Short Pay Dispute/Suspense</span><span className="font-semibold text-slate-900">$10,000</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Customer Email</span><span className="font-semibold text-slate-900">Sent</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Follow-up Task</span><span className="font-semibold text-slate-900">Created</span></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">Case Status: Resolved – Awaiting Customer Documentation</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200 flex flex-col justify-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Dashboard Update</p>
                    <p className="text-sm text-blue-800">
                      REM_008 — Castellan Restructuring Ltd will appear in the Cash Applications dashboard as <span className="font-semibold">Awaiting Documentation</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer: Back + Next Step for Castellan steps 6–11 */}
        <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
          {currentStep === 10 ? (
            <button onClick={handleNihonBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Cash Applications
            </button>
          ) : currentStep === 8 ? (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleNihonApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                <CheckCircle2 className="w-4 h-4" />
                Approve & Post to D365
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <FileText className="w-4 h-4" />
                Create Journal Draft
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-white text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <XCircle className="w-4 h-4" />
                Reject Recommendation
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </motion.div>;
    }

    return <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
      {/* Horizontal Stepper - Compact */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            {currentSteps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const label = step.title.replace(/\s+/, '\n');
              return <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white ring-2 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 whitespace-pre-line ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {STEP_AGENT_MAP[step.title] && (
                    <span className="text-[8px] text-slate-400 text-center mt-0.5 px-0.5 truncate w-full" title={STEP_AGENT_MAP[step.title]}>
                      {STEP_AGENT_MAP[step.title]}
                    </span>
                  )}
                </div>
                {index < currentSteps.length - 1 && <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
                  <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>}
              </React.Fragment>;
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Step 1: Split Screen Layout */}
        {currentStep === 0 && <div className="h-full flex flex-row">
          {processingRowId === '9' ? (
            /* Bank Fees Step 0: Case Overview */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Outlook Format</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Vantage Global Advisors</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Mar 18, 10:22 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment advice – Invoice KRL-INV-4890</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Hello,</p>
                        <p>Please find below details of our payment for invoice KRL-INV-4890 (Restructuring Advisory Retainer – Mar 2026).</p>
                        <p className="mt-4">We have transferred <strong>$24,850</strong> to your account. Remittance advice is attached.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">Best regards,<br />Vantage Global Advisors — Finance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Kroll Case Resolution</h2>
                      <p className="text-sm text-slate-500">Case Summary</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Summary Panel</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Email ID', value: 'REM_009' },
                        { field: 'Customer', value: 'Vantage Global Advisors' },
                        { field: 'Invoice', value: 'KRL-INV-4890' },
                        { field: 'Invoice Description', value: 'Restructuring Advisory Retainer – Mar 2026' },
                        { field: 'Invoice Amount', value: '$25,000' },
                        { field: 'Payment Received', value: '$24,850' },
                        { field: 'Short Payment', value: '$150' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      AI System Message
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Payment variance detected. Small deduction in typical bank fee range. Initiating bank-fee path (not WHT).
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">REM_009 — Vantage Global Advisors</p>
                    <p className="text-slate-600 text-xs mt-1">Amount: $25,000 · Region: NA</p>
                    <p className="text-slate-500 text-xs font-medium mt-1">AI Confidence: 92%</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '7' ? (
            /* Nakamura Holdings Step 0: Case Overview */
            <React.Fragment>
              {/* Left: Email / Source Document */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Outlook Format
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Nakamura Holdings KK Ltd</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Feb 17, 9:15 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment advice – Invoice KRL-INV-4847</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Hello,</p>
                        <p>Please find below details of our payment for invoice KRL-INV-4847 (Valuation Advisory Services – Feb 2026).</p>
                        <p className="mt-4">We have transferred <strong>$70,000</strong> to your account.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                          Best regards,<br />
                          Nakamura Holdings KK — AP Team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Right: Case Summary Panel + AI System Message */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Kroll Case Resolution</h2>
                      <p className="text-sm text-slate-500">Case Summary</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Summary Panel</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Email ID', value: 'REM_007' },
                        { field: 'Customer', value: 'Nakamura Holdings KK Ltd' },
                        { field: 'Invoice', value: 'KRL-INV-4847' },
                        { field: 'Invoice Description', value: 'Valuation Advisory Services – Feb 2026' },
                        { field: 'Invoice Amount', value: '$100,000' },
                        { field: 'Payment Received', value: '$70,000' },
                        { field: 'Short Payment', value: '$30,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      AI System Message
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Payment variance detected. Initiating automated investigation using remittance data, customer tax profile, and historical payment behavior.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">REM_007 — Nakamura Holdings KK Ltd</p>
                    <p className="text-slate-600 text-xs mt-1">Amount: $100,000 · Region: NA</p>
                    <p className="text-slate-500 text-xs font-medium mt-1">AI Confidence: 94%</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-amber-900">Documentation SLA</h3>
                        <p className="text-xs text-amber-800 mt-1">Proof of payment for the <strong>$30,000</strong> withholding must be received within <strong>30 days</strong> of posting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '8' ? (
            /* Castellan Step 0: Case Overview */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Castellan Restructuring Ltd</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">17 Feb 2026, 11:22 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment – Invoice KRL-INV-4863</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Hello,</p>
                        <p>
                          We have sent a payment of <strong>$35,000</strong> against invoice <strong>KRL-INV-4863</strong> (Transaction Due Diligence – Feb 2026).
                          A withholding amount of <strong>$15,000</strong> has been applied in line with our current tax setup.
                        </p>
                        <p>The detailed remittance advice is attached for your records.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">Best regards, Castellan Restructuring Ltd — Finance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Over-withholding suspected → Human Review Required</p>
                      <p className="text-xs text-amber-800 mt-0.5">Invoice: $50,000 · Payment: $35,000 · Short Pay: $15,000</p>
                      <p className="text-xs text-amber-700 mt-1">AI detects 30% withholding, but treaty rate should be 10% if documentation were valid.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Summary</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Email ID', value: 'REM_008' },
                        { field: 'Customer', value: 'Castellan Restructuring Ltd' },
                        { field: 'Invoice', value: 'KRL-INV-4863' },
                        { field: 'Description', value: 'Software Subscription' },
                        { field: 'Invoice Amount', value: '$50,000' },
                        { field: 'Payment Received', value: '$35,000' },
                        { field: 'Short Pay', value: '$15,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      System message
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Payment variance detected. Running automated analysis using remittance data, customer tax profile and treaty validation.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">REM_008 — Castellan Restructuring Ltd</p>
                    <p className="text-slate-600 text-xs mt-1">Amount: $50,000 · Region: APAC</p>
                    <p className="text-slate-500 text-xs font-medium mt-1">AI Confidence: 91%</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '11' ? (
            /* Calderwood Advisory Group Step 0: Case Overview */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Bank advice — direct debit collection</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">HSBC · SEPA Direct Debit</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Calderwood Advisory Group</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Jun 5, 10:15 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">SEPA Direct Debit — Mandate SEPA-DD-KRL-0098</div>
                          <div className="text-xs text-slate-400 mt-1">Bank: HSBC · Region: EMEA</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Collection method</span>
                          <span className="font-semibold">Direct Debit (SEPA mandate SEPA-DD-KRL-0098)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Amount collected</span>
                          <span className="font-semibold">$80,250</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Against invoice</span>
                          <span className="font-semibold">KRL-INV-4970 ($80,000)</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Region</span>
                          <span className="font-semibold">EMEA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Direct debit reference matched</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Customer identified</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Invoice located</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Overpayment Detected</p>
                      <p className="text-xs text-amber-800 mt-1">Payment exceeds invoice by $250 — overpayment requires refund/write-off handling.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Summary</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Email ID', value: 'REM_011' },
                        { field: 'Bank', value: 'HSBC' },
                        { field: 'Customer', value: 'Calderwood Advisory Group' },
                        { field: 'Collection Method', value: 'SEPA Direct Debit (SEPA-DD-KRL-0098)' },
                        { field: 'Amount Collected', value: '$80,250' },
                        { field: 'Invoice', value: 'KRL-INV-4970 ($80,000)' },
                        { field: 'Variance', value: '+$250 overpayment' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '10' ? (
            /* Harborview Partners LLP Step 0: Case Overview */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Outlook Format</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Harborview Partners LLP</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Jun 5, 9:08 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment Remittance – Invoice INV-4901</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Hello,</p>
                        <p>Please find our remittance for invoice <strong>INV-4901</strong>. We have transferred <strong>$125,000</strong> via Citi Bank.</p>
                        <p className="mt-2">Bank: <strong>Citi</strong> · Payer: Harborview Partners LLP · Region: NA · Ref: INV-4901</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">Best regards,<br />Harborview Partners LLP — Finance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Email identified</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Customer name read</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Duplicate / Misapplied Cash Alert</p>
                      <p className="text-xs text-amber-800 mt-1">Applied invoice KRL-INV-4901 is in Settled status — possible duplicate / misapplied cash.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Summary</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Email ID', value: 'REM_010' },
                        { field: 'Bank', value: 'Citi' },
                        { field: 'Payer', value: 'Harborview Partners LLP' },
                        { field: 'Amount', value: '$125,000' },
                        { field: 'Remittance Ref', value: 'INV-4901' },
                        { field: 'Region', value: 'NA' },
                        { field: 'AI Context', value: 'Possible duplicate / misapplied' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '4' ? (
            /* Harlow Crane LLP Step 0: Reading Remittance - Missing Data */
            <React.Fragment>
              {/* Left: Email Mockup - Scrollable */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Outlook Format
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Harlow Crane LLP</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Feb 17, 8:30 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Remittance Advice – Matters KRL-MAT-2025-0312 & KRL-MAT-2025-0318</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Dear Kroll AR Team,</p>
                        <p>Please find attached our wire transfer covering outstanding advisory fees for Matters KRL-MAT-2025-0312 (Restructuring Advisory) and KRL-MAT-2025-0318 (Valuation Advisory). Total payment of <strong>$142,500.00</strong> was sent via wire on <strong>17 Feb 2026</strong>. Kindly apply against open invoices on our account.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                          Best regards,<br />
                          Harlow Crane LLP<br />
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bank Statement Data</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Bank Reference</span>
                        <span className="font-mono font-semibold text-slate-900">BOFA-883729</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-semibold text-slate-900">$142,500.00</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Channel</span>
                        <span className="font-semibold text-slate-900">Lockbox</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">Received</span>
                        <span className="font-semibold text-slate-900">17 Feb 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: AI Extraction - Scrollable */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">AI Analysis</h2>
                        <p className="text-sm text-slate-500">Live extraction results</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      Attention Needed
                    </div>
                  </div>

                  {/* Grid Layout: 2 columns */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document Source */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-600" />
                          Document Source
                        </h3>
                      </div>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Source</span>
                          <span className="text-xs font-semibold text-slate-900">Bank statement + email intake</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Channel</span>
                          <span className="text-xs font-semibold text-slate-900">Lockbox</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Received on</span>
                          <span className="text-xs font-semibold text-slate-900">17 Feb 2026</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs font-medium text-slate-600">Bank reference</span>
                          <span className="text-xs font-mono font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">BOFA-883729</span>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Payment Signals */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-600" />
                          Extracted Payment Signals
                        </h3>
                      </div>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Customer name detected</span>
                          <span className="text-xs font-semibold text-slate-900">Harlow Crane LLP</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Amount</span>
                          <span className="text-xs font-bold text-slate-900">$142,500</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Currency</span>
                          <span className="text-xs font-semibold text-slate-900">USD</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs font-medium text-slate-600">Structured remittance</span>
                          <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Not found
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Interpretation */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-amber-100 border-b border-amber-200 px-4 py-3">
                        <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-amber-700" />
                          AI Interpretation
                        </h3>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-start gap-2 py-1">
                          <XCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900">No invoice reference in email body</p>
                            <p className="text-[10px] text-amber-700 mt-0.5">AI could not locate any invoice numbers or references.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 py-1">
                          <XCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900">No remittance attachment detected</p>
                            <p className="text-[10px] text-amber-700 mt-0.5">No structured remittance file (CSV, EDI, PDF) found.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 py-1">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900">Free-text note → "Invoice payment" (non-usable)</p>
                            <p className="text-[10px] text-amber-700 mt-0.5">Generic payment description insufficient for automated allocation.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-600" />
                          Confidence
                        </h3>
                      </div>
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-600">Customer detection</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 w-8 text-right">96%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs font-medium text-slate-600">Allocation readiness</span>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold text-rose-600">0%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Result - Full Width */}
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-rose-100 border-b border-rose-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        Result
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-rose-200 p-2 rounded-full">
                          <AlertTriangle className="w-5 h-5 text-rose-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-rose-900 mb-1">⚠ Remittance data missing</p>
                          <p className="text-xs text-rose-700 leading-relaxed">
                            Payment received and customer identified, but insufficient remittance details for automated allocation. Manual intervention required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '5' ? (
            /* Sterling Trust Bank Step 0: Reading Remittance */
            <React.Fragment>
              {/* Left: Email Mockup - Scrollable */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Outlook Format
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Sterling Trust Bank Accounts Payable</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Feb 17, 10:15 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment for outstanding invoices – Sterling Trust Bank</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Hi AR Team,</p>
                        <p>We have sent a payment for the account.</p>

                        <div className="bg-slate-50 border-l-4 border-indigo-500 p-6 my-6 space-y-3 not-prose rounded-r-lg">
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Amount</span>
                            <span className="font-bold text-slate-800 text-lg">$98,000.00</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Method</span>
                            <span className="text-slate-800 font-medium">Bank Transfer</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Bank</span>
                            <span className="text-slate-800 font-medium">HSBC</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Date</span>
                            <span className="text-slate-800 font-medium">February 17, 2026</span>
                          </div>
                        </div>

                        <p>Please allocate this to the Sterling Trust Bank account.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                          Best regards,<br />
                          Sterling Trust Bank Finance Team<br />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: AI Extraction - Scrollable */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">AI Analysis</h2>
                        <p className="text-sm text-slate-500">Live extraction results</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      Attention Needed
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                    <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Missing invoice reference detected</h4>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        The document does not contain an explicit invoice number. AI will attempt to match based on amount and open balance.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Historical payment behavior (last 12 months)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Average days to pay</span>
                        <span className="font-bold text-slate-800">8 days</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Typical deduction %</span>
                        <span className="font-bold text-slate-800">2%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">% of invoices with discount deducted</span>
                        <span className="font-bold text-slate-800">85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shadow-lg">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Extracted from document</h3>
                        <p className="text-sm text-slate-500">Key fields identified by AI</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {/* Customer Name */}
                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Name</p>
                            <p className="font-semibold text-slate-800">Sterling Trust Bank</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>

                      {/* Amount */}
                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                            <p className="font-semibold text-slate-800">$98,000</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>

                      {/* Invoice Reference - Not Found */}
                      <div className="p-4 bg-amber-50/30 hover:bg-amber-50 transition-colors flex items-center justify-between group border-l-4 border-amber-400">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Invoice Reference</p>
                            <p className="font-bold text-amber-700">Not found</p>
                          </div>
                        </div>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            /* Aldridge Pharma Step 0 (Original) */
            <React.Fragment>
              {/* Left: Email Mockup - Scrollable */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Original email content</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Outlook Format
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">Aldridge Pharma Treasury</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">Feb 17, 9:42 AM</span>
                          </div>
                          <div className="text-sm text-slate-600 truncate">Subject: Payment Confirmation - Wire Transfer</div>
                          <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="prose prose-sm max-w-none text-xs text-slate-600">
                        <p>Dear Accounts Receivable Team,</p>
                        <p>Please find the payment details for our outstanding invoice:</p>

                        <div className="bg-slate-50 border-l-4 border-blue-500 p-6 my-6 space-y-3 not-prose rounded-r-lg">
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Amount</span>
                            <span className="font-bold text-slate-800 text-lg">$180,000.00</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Invoice Ref</span>
                            <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">KRL-INV-4845</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Method</span>
                            <span className="text-slate-800 font-medium">Wire Transfer</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Bank</span>
                            <span className="text-slate-800 font-medium">Citibank</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Date</span>
                            <span className="text-slate-800 font-medium">February 17, 2026</span>
                          </div>
                        </div>

                        <p>Payment has been initiated and should reflect in your account within 24 hours.</p>
                        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                          Best regards,<br />
                          Aldridge Pharma Treasury Department<br />
                          <i>This is an automated payment advice.</i>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: AI Extraction - Scrollable */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">AI Analysis</h2>
                        <p className="text-sm text-slate-500">Live extraction results</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                      <Zap className="w-3 h-3 fill-current" />
                      High Confidence
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                      <div className="w-8 h-8 bg-[#00263A] rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Email Source Identified</h3>
                        <p className="text-sm text-slate-500">Verified sender from known customer domain</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sender Address</p>
                            <p className="font-semibold text-slate-800">treasury@contoso.com</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>

                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-amber-600 group-hover:shadow-md transition-all">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Entity</p>
                            <p className="font-semibold text-slate-800">Citibank NA</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>

                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-purple-600 group-hover:shadow-md transition-all">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Class</p>
                            <p className="font-semibold text-slate-800">Payment Advice / Remittance</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>

                      <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-rose-600 group-hover:shadow-md transition-all">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Received Timestamp</p>
                            <p className="font-semibold text-slate-800">Feb 17, 2026 • 09:42:15 AM</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                    <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Extraction Ready</h4>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Document structure successfully parsed. High quality text detected. 100% of key fields are identifiable.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </div>}

        {/* Step 2: Comprehensive Extraction View */}
        {currentStep === 1 && <div className="h-full flex flex-row">
          {processingRowId === '9' ? (
            /* Bank Fees Step 1: Bank Fee Likelihood */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Match & Reconciliation Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Matching Results</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { param: 'Payer', result: 'Vantage Global Advisors' },
                        { param: 'Matched Invoice', result: 'KRL-INV-4890' },
                        { param: 'Match Confidence', result: '97%' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.param}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment Comparison</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { item: 'Invoice Amount', amount: '$25,000' },
                        { item: 'Payment Received', amount: '$24,850' },
                        { item: 'Variance', amount: '$150' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.item}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Variance Pattern Analysis</h3>
                    <p className="text-xs text-amber-800 mb-2">AI evaluates the variance:</p>
                    <p className="text-sm text-amber-900">Variance = $150, within typical bank fee band ($15–$250). Pattern consistent with bank/intermediary fee, not withholding.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Insight
                    </h3>
                    <p className="text-sm text-blue-800">High confidence: bank/intermediary fee deduction (92%). Not WHT.</p>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Documentation
                    </h3>
                    <p className="text-sm text-slate-700">No withholding documentation required for bank-fee path.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '7' ? (
            /* Nakamura Holdings Step 1: Payment Matching Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Match & Reconciliation Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Matching Results</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { param: 'Payer', result: 'Nakamura Holdings KK Ltd' },
                        { param: 'Matched Invoice', result: 'KRL-INV-4847' },
                        { param: 'Match Confidence', result: '97%' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.param}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment Comparison</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { item: 'Invoice Amount', amount: '$100,000' },
                        { item: 'Payment Received', amount: '$70,000' },
                        { item: 'Variance', amount: '$30,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.item}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Variance Pattern Analysis</h3>
                    <p className="text-xs text-amber-800 mb-2">AI evaluates the variance:</p>
                    <p className="text-sm text-amber-900">Variance = 30% of invoice value. Pattern consistent with withholding deduction.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Insight
                    </h3>
                    <p className="text-sm text-blue-800">Detected short payment likely due to withholding tax. Likelihood: 96%</p>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      SLA
                    </h3>
                    <p className="text-sm text-slate-700">$30,000 withholding proof due within <strong>30 days</strong>.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '8' ? (
            /* Castellan Step 1: Payment Matching */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Match & Reconcile Agent</h2>
                  <p className="text-sm text-slate-600">The Match & Reconcile Agent identifies the invoice.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Match Result</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Matched Invoice', result: 'KRL-INV-4863' },
                        { field: 'Match Confidence', result: '96%' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment Comparison</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { item: 'Invoice', amount: '$50,000' },
                        { item: 'Payment', amount: '$35,000' },
                        { item: 'Variance', amount: '$15,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.item}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI observation</h3>
                    <p className="text-sm text-blue-800">
                      Variance equals 30% of invoice amount. Pattern is inconsistent with withholding deduction, which has been ~10% during the last 12 months.
                    </p>
                    <ul className="mt-3 text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Invoice and payment currencies match.</li>
                      <li>No other adjustments (fees, discounts) detected in bank/remittance data.</li>
                      <li>Customer historically pays invoices net of withholding.</li>
                      <li>No dispute raised against the invoice.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Likelihood</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">94% Withholding</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Based on variance pattern, customer behavior, and absence of non-tax explanations.
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">What this step does</h3>
                    <p className="text-sm text-emerald-800">
                      Confirms that the short pay behaves like a tax deduction. The next step is to validate this against the remittance
                      text to ensure withholding is explicitly referenced.
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '4' ? (
            /* Harlow Crane Step 1: Extracting Payment Data */
            <React.Fragment>
              {/* Left Panel: Payment Metadata */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-slate-500" />
                      Payment Metadata
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Payment method</span>
                        <span className="text-sm font-semibold text-slate-800">Wire transfer</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Value date</span>
                        <span className="text-sm font-semibold text-slate-800">17 Feb 2026</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Company code</span>
                        <span className="text-sm font-semibold text-slate-800">KRL-US</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-xs text-slate-500">Incoming bank</span>
                        <span className="text-sm font-semibold text-slate-800">Bank of America</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Cash Application Context
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <span className="text-sm text-slate-600">Auto-match attempt</span>
                        <span className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Tolerance rule</span>
                        <span className="text-sm font-semibold text-slate-800">Not applicable</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Reason</span>
                        <span className="text-sm font-semibold text-slate-800">No allocation details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel: AI Data Normalization */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-500" />
                        AI Data Normalization
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Payment classified as</span>
                        <span className="text-sm font-semibold text-slate-800">Unapplied cash candidate</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Case ID generated</span>
                        <span className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-200">CA-2026-00451</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4 shadow-sm">
                    <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Allocation details missing</h4>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        Payment cannot be automatically allocated. Proceeding to customer matching to identify potential invoices.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '5' ? (
            /* Sterling Trust Bank Step 1: Extracting Payment Data */
            <React.Fragment>
              {/* Left Panel: Remittance Data */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-slate-500" />
                      Remittance Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Source</span>
                        <span className="text-sm font-semibold text-slate-800">HSBC Bank Wire</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Received</span>
                        <span className="text-sm font-semibold text-slate-800">Feb 17, 10:15 AM</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Method</span>
                        <span className="text-sm font-semibold text-slate-800">Bank Transfer</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-xs text-slate-500">Currency</span>
                        <span className="text-sm font-semibold text-slate-800">EUR</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Extracted Payment Details
                    </h3>
                    <div className="space-y-3">
                      {[{ label: 'Amount', value: '$98,000.00' }, { label: 'Value Date', value: '17 Feb 2026' }, { label: 'Bank Ref', value: 'LIT-2026-X' }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-500">{item.label}</span>
                          <span className="font-mono font-bold text-slate-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel: Validation */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="bg-gradient-to-r from-amber-50 to-white px-4 py-3 border-b border-amber-100">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Review Required
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Extraction Confidence</span>
                        <span className="font-bold text-amber-600">90%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      AI Validation Checks
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-900">Structured payment detected</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-900">Currency identified (EUR)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-amber-900">No invoice number present</span>
                          <p className="text-xs text-amber-700 mt-1">Cross-referencing open items to identify match.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            /* Aldridge Pharma Step 1 (Original) */
            <React.Fragment>
              {/* Left Panel: Remittance Data */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-slate-500" />
                      Remittance Data
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Source</span>
                        <span className="text-sm font-semibold text-slate-800">Citi Bank Wire</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Received</span>
                        <span className="text-sm font-semibold text-slate-800">Feb 17, 09:42 AM</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Method</span>
                        <span className="text-sm font-semibold text-slate-800">Wire Transfer</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-xs text-slate-500">Currency</span>
                        <span className="text-sm font-semibold text-slate-800">USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Extracted Payment Details
                    </h3>
                    <div className="space-y-3">
                      {[{ label: 'Amount', value: '$180,000' }, { label: 'Value Date', value: '17 Feb 2026' }, { label: 'Bank Ref', value: 'WIRE-8847291' }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-500">{item.label}</span>
                          <span className="font-mono font-bold text-slate-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel: Identification & Validation */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Customer ID</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">Aldridge Pharma Group</p>
                      <p className="text-xs text-slate-400">ID: CL-2025-0072</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Invoice Match</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">KRL-INV-4845</p>
                      <p className="text-xs text-slate-400">Open Amount: $180,000</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      AI Validation Checks
                    </h3>
                    <div className="space-y-3">
                      {['Amount matches invoice exactly', 'Customer matched to master data', 'Invoice is currently open', 'No duplicate payment detected'].map((check, idx) => <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-emerald-900">{check}</span>
                      </div>)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </div>}

        {/* Step 3: Customer Matching */}
        {currentStep === 2 && <div className="h-full flex flex-row">
          {processingRowId === '9' ? (
            /* Bank Fees Step 2: Remittance Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Remittance Document AI Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Document Extract</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-slate-600">Remittance file:</p>
                      <p className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">Remittance_Vantage-KRL-INV-4890.pdf</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Received</span>
                          <span className="font-medium text-slate-800">18 Mar 2026</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Source</span>
                          <span className="font-medium text-slate-800">Lockbox · Email</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Extraction confidence</span>
                          <span className="font-semibold text-emerald-600">97%</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">Extracted text:</p>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        Payment for invoice KRL-INV-4890. Net amount after bank/wire charges. See attached statement.
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2 bg-slate-50 border-b border-slate-100">Structured fields</h4>
                        <div className="p-4 space-y-2">
                          {[
                            { label: 'Invoice reference', value: 'KRL-INV-4890' },
                            { label: 'Deduction noted', value: '$150 (bank/wire charges)' },
                            { label: 'Payer (from document)', value: 'Vantage Global Advisors' }
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className="text-slate-500">{row.label}</span>
                              <span className="font-medium text-slate-800">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Key Signal Detection</h3>
                    <p className="text-xs text-amber-800 mb-2">AI highlights:</p>
                    <p className="text-sm font-bold text-amber-900 bg-amber-100 px-3 py-2 rounded-lg inline-block">BANK FEE KEYWORDS DETECTED</p>
                    <p className="text-xs text-amber-700 mt-2">Keywords in remittance: &quot;bank fee&quot;, &quot;charges&quot;, &quot;SWIFT&quot;.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document requirement
                    </h3>
                    <p className="text-sm text-slate-700">No tax documentation required. Variance treated as bank fee.</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Next step</h3>
                    <p className="text-sm text-emerald-800">Policy check: absorb vs chargeback.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '7' ? (
            /* Nakamura Holdings Step 2: Remittance Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Remittance Document AI Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Document Extract</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-slate-600">Remittance file:</p>
                      <p className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">Remittance_BW-REM-33221.pdf</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Received</span>
                          <span className="font-medium text-slate-800">17 Feb 2026</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Source</span>
                          <span className="font-medium text-slate-800">Lockbox · Email</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Pages</span>
                          <span className="font-medium text-slate-800">1</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Extraction confidence</span>
                          <span className="font-semibold text-emerald-600">98%</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">Extracted text:</p>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        Payment for invoice KRL-INV-4847. Net amount differs from invoice total; see attached statement for deduction details.
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2 bg-slate-50 border-b border-slate-100">Structured fields</h4>
                        <div className="p-4 space-y-2">
                          {[
                            { label: 'Invoice reference', value: 'KRL-INV-4847' },
                            { label: 'Deduction noted', value: '$30,000 (reason unspecified in remittance)' },
                            { label: 'Supporting detail', value: 'See payer statement / attachments' },
                            { label: 'Payer (from document)', value: 'Nakamura Holdings KK Ltd' }
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className="text-slate-500">{row.label}</span>
                              <span className="font-medium text-slate-800">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Key Signal Detection</h3>
                    <p className="text-xs text-amber-800 mb-2">AI highlights:</p>
                    <p className="text-sm font-bold text-amber-900 bg-amber-100 px-3 py-2 rounded-lg inline-block">PATTERN MATCHED DEDUCTION</p>
                    <p className="text-xs text-amber-700 mt-2">Signal strength: High · Short payment of $30,000 aligns with typical tax withholding percentages for this customer and country.</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document requirement
                    </h3>
                    <p className="text-sm text-slate-700">Form 1042-S or equivalent required for $30,000 withholding. <strong>30-day SLA</strong> from posting.</p>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Policy reference
                    </h3>
                    <p className="text-xs text-slate-600 mb-1">IRS Ch. 3 – Withholding on payments to non-US persons.</p>
                    <p className="text-xs text-slate-600">Royalty payments to treaty-eligible entities subject to reduced or documented withholding.</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Next step</h3>
                    <p className="text-sm text-emerald-800">Customer Tax Profile will be checked (W-8BEN-E, treaty status) to validate withholding treatment.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '8' ? (
            /* Castellan Step 2: Remittance Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Remittance Analysis</h2>
                  <p className="text-sm text-slate-600">Remittance document processed.</p>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Extracted Document</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-slate-600">Remittance file:</p>
                      <p className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">Remittance_ND-REM-88410.pdf</p>
                      <p className="text-sm text-slate-600">Extracted text:</p>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        Payment for invoice KRL-INV-4863. Withholding tax applied.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">AI interpretation</h3>
                    <p className="text-sm text-blue-800">
                      Remittance explicitly references withholding tax. This confirms that the $15,000 variance is being treated by the payer as withholding,
                      not as fees, discounts, or disputed amounts.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Document signals</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Invoice reference KRL-INV-4863 is present in the text.</li>
                      <li>Phrase <span className="font-semibold">“Withholding tax applied”</span> is detected.</li>
                      <li>No language found about partial disputes, fee adjustments, or early‑payment discounts.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">What this step confirms</h3>
                    <p className="text-sm text-slate-700">
                      The remittance supports the hypothesis that the short payment is entirely due to tax withholding.
                      The next step is to review the customer&apos;s tax profile and documentation to determine whether 30% or a reduced treaty rate should apply.
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '4' ? (
            /* Harlow Crane Step 2: Matching Customer */
            <React.Fragment>
              {/* Left Panel: Customer Master Match */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">Customer Master Match</h3>
                        <p className="text-xs text-emerald-700">Matched to master data</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Customer', value: 'Harlow Crane LLP' },
                        { label: 'Customer ID', value: 'CL-2025-0304' },
                        { label: 'Account status', value: 'Active' },
                        { label: 'Credit block', value: 'No' },
                        { label: 'Payment block', value: 'No' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-emerald-100 last:border-0">
                          <span className="text-sm text-emerald-700">{item.label}</span>
                          <span className="font-bold text-emerald-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">AR Snapshot</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total open AR</span>
                        <span className="font-bold text-slate-800">$640,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Overdue</span>
                        <span className="font-bold text-rose-600">$120,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600">Oldest invoice</span>
                        <span className="font-bold text-slate-800">38 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel: Matching Signals & Confidence */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Matching Signals
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Legal name match',
                        'Bank account mapped to customer',
                        'Historical payment behavior match',
                        'Region alignment'
                      ].map((signal, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-emerald-900">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Confidence</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Customer match</span>
                          <span className="font-bold text-emerald-600">99%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '99%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Customer identified successfully</h4>
                      <p className="text-xs text-emerald-700 mt-1">Harlow Crane LLP matched with 99% confidence. Proceeding to invoice lookup.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '5' ? (
            /* Sterling Trust Bank Step 3 */
            <React.Fragment>
              {/* Left Panel: Customer Match */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">Customer Match Found</h3>
                        <p className="text-xs text-emerald-700">Matched to master data</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[{ label: 'Customer', value: 'Sterling Trust Bank' }, { label: 'Customer ID', value: 'CL-2025-0156' }, { label: 'Company Code', value: 'KRL-EU' }, { label: 'Region', value: 'Europe' }, { label: 'Status', value: 'Active' }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-emerald-100 last:border-0">
                          <span className="text-sm text-emerald-700">{item.label}</span>
                          <span className="font-bold text-emerald-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Customer Match Confidence</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Customer Match</span>
                          <span className="font-bold text-emerald-600">97%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '97%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel: Matching Signals */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Matching Signals
                    </h3>
                    <div className="space-y-3">
                      {['Customer name similarity', 'Bank account mapped to customer', 'Historical payment match'].map((signal, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-emerald-900">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Customer identified successfully</h4>
                      <p className="text-xs text-emerald-700 mt-1">Sterling Trust Bank matched with 97% confidence. Proceeding to invoice lookup.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            /* Aldridge Pharma Step 3 (Original) */
            <React.Fragment>
              {/* Left Panel: Allocation Summary */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Allocation Details</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Customer</span>
                        <span className="font-bold text-slate-800 text-lg">Aldridge Pharma Group</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-slate-500">Invoice</span>
                        <span className="font-mono font-bold text-blue-600">KRL-INV-4845</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-bold text-slate-800">$180,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Company Code</span>
                        <span className="font-bold text-slate-800">KRL-US</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Confidence Breakdown</h3>
                    <div className="space-y-4">
                      {[{ label: 'Customer Match', value: 99 }, { label: 'Invoice Match', value: 96 }, { label: 'Amount Match', value: 100 }].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-bold text-emerald-600">{item.value}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Right Panel: Controls */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Controls &amp; Validations
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[{ check: 'Customer active', detail: 'Status verified' }, { check: 'Invoice open', detail: 'Ready for payment' }, { check: 'No duplicate', detail: 'Unique transaction' }, { check: 'Within tolerance', detail: 'Zero variance' }].map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.check}</p>
                            <p className="text-xs text-slate-500">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold text-sm">All SOX controls passed</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-blue-900">Simulation: Success</h3>
                    </div>
                    <p className="text-blue-800 text-sm mb-2">Simulated posting to D365 returns success code.</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white/50 rounded border border-blue-200 text-xs font-mono text-blue-700">Type: DZ</span>
                      <span className="px-2 py-1 bg-white/50 rounded border border-blue-200 text-xs font-mono text-blue-700">Account: 100234</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </div>}

        {/* Nakamura Holdings Step 5: Resolution Recommendation */}
        {currentStep === 5 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Kroll AI Agent</h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  AI Decision
                </h3>
                <p className="text-sm text-emerald-800 mb-4">Short payment classified as legitimate withholding deduction. Invoice can be settled by posting withholding receivable.</p>
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">SLA: Proof of payment for $30,000 withholding due within <strong>30 days</strong> of posting.</p>
                <h3 className="text-sm font-bold text-emerald-900 mb-2 mt-4">Proposed Accounting Resolution</h3>
                <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                  <li>Apply received payment</li>
                  <li>Book withholding tax receivable</li>
                  <li>Clear invoice</li>
                </ul>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case at a glance</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-semibold text-slate-800">KRL-INV-4847</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Variance</span><span className="font-semibold text-slate-800">$30,000 (WHT)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Resolution</span><span className="font-semibold text-emerald-600">Post WHT receivable</span></div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Documentation SLA</h3>
                    <p className="text-xs text-amber-800 mt-1">Proof of payment for the <strong>$30,000</strong> withholding must be received within <strong>30 days</strong> of posting.</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Next steps</p>
                <p className="text-sm text-blue-800 mt-1">D365 posting preview → Customer email → Approval</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Bank Fees Step 5: D365 Posting Preview */}
        {currentStep === 5 && processingRowId === '9' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">D365 Accounting Posting Preview</h2>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Journal Entry (Option B1: Absorb)</h3>
                </div>
                <div className="p-4 font-mono text-sm space-y-2">
                  <p className="text-slate-800">Dr Cash                          24,850</p>
                  <p className="text-slate-800">Dr Bank Charges Expense          150</p>
                  <p className="text-slate-800">Cr Accounts Receivable          25,000</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Posting Explanation</h3>
                <p className="text-sm text-slate-700">Invoice fully cleared. $150 captured as expense with reason code BNK_FEE.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2">D365 Actions</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Apply payment to invoice KRL-INV-4890</li>
                  <li>Post bank fee using reason code BNK_FEE</li>
                  <li>Mark invoice Fully Settled</li>
                </ul>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Posting summary</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Cash applied</span><span className="font-semibold text-slate-800">$24,850</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Bank fee expense</span><span className="font-semibold text-slate-800">$150</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono font-semibold text-slate-800">KRL-INV-4890</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reason code</span><span className="font-mono font-semibold text-slate-800">BNK_FEE</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Bank Fees Step 6: Customer Outreach */}
        {currentStep === 6 && processingRowId === '9' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Customer Outreach</h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  No outreach required
                </h3>
                <p className="text-sm text-emerald-800">Policy is Absorb. Internal recording only. Case ready for approval.</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Next step</p>
                <p className="text-sm text-blue-800 mt-1">Approve & Post to D365</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Nakamura Holdings Step 6: D365 Accounting Posting Preview */}
        {currentStep === 6 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">D365 Accounting Posting Preview</h2>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Journal Entry</h3>
                </div>
                <div className="p-4 font-mono text-sm space-y-2">
                  <p className="text-slate-800">Dr Cash                          $70,000</p>
                  <p className="text-slate-800">Dr Withholding Tax Receivable    $30,000</p>
                  <p className="text-slate-800">Cr Accounts Receivable          $100,000</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Posting Explanation</h3>
                <p className="text-sm text-slate-700 mb-2">Cash received applied to invoice. Withholding tax amount recorded as receivable until withholding certificate is received.</p>
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">Documentation SLA: $30,000 proof due within <strong>30 days</strong>.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2">D365 Actions</h3>
                <p className="text-xs text-blue-800 mb-2">The AI will:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Apply payment to invoice KRL-INV-4847</li>
                  <li>Post deduction using reason code WHT_US</li>
                  <li>Mark invoice Fully Settled</li>
                  <li>Create follow-up task for documentation</li>
                </ul>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Posting summary</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Cash applied</span><span className="font-semibold text-slate-800">$70,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">WHT receivable</span><span className="font-semibold text-slate-800">$30,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono font-semibold text-slate-800">KRL-INV-4847</span></div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Follow-up & SLA</h3>
                    <p className="text-xs text-amber-800 mt-1">A follow-up task will be created. Proof of $30,000 withholding due within <strong>30 days</strong>.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reason code</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">WHT_US</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Nakamura Holdings Step 7: Customer Documentation Request */}
        {currentStep === 7 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Customer Documentation Request</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">SLA: Proof of $30,000 withholding required within <strong>30 days</strong> of posting.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Generated Email</h3>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-slate-600"><span className="font-semibold">Subject:</span> Request for Payment Variance Details — Invoice KRL-INV-4847</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                    <p className="mb-2">Hello Nakamura Holdings KK — AP Team,</p>
                    <p className="mb-2">We received your payment of $70,000 against invoice KRL-INV-4847 totaling $100,000.</p>
                    <p className="mb-2">Our reconciliation shows a $30,000 difference between the invoice amount and the payment received. To complete our records and classify this variance correctly, could you please share the supporting documentation explaining this deduction (for example, any applicable tax or regulatory documentation)?</p>
                    <p>Thank you.</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                Sending this email automatically creates a D365 tracking ticket for audit and follow-up.
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-bold hover:bg-[#003354] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Draft
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                  Skip Communication
                </button>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Documentation SLA</h3>
                    <p className="text-xs text-amber-800 mt-1 mb-2">Proof of payment for the <strong>$30,000</strong> withholding must be received within <strong>30 days</strong> of posting.</p>
                    <p className="text-xs font-semibold text-amber-900">Required: Form 1042-S or equivalent</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Request purpose</h3>
                <p className="text-sm text-slate-700">This email requests the withholding certificate so the receivable can be cleared within the 30-day SLA window.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900">Recipient</p>
                <p className="text-sm text-blue-800 mt-0.5">Nakamura Holdings KK — AP Team</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Nakamura Holdings Step 8: Documentation Received — inbound email with proof, ready to post */}
        {currentStep === 8 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Documentation Received</h2>
              <p className="text-sm text-slate-600">Inbound email with withholding proof in attachments. Case is now ready to post to D365.</p>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 truncate">Nakamura Holdings KK — AP Team</span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">20 Feb 2026, 10:42 AM</span>
                      </div>
                      <div className="text-sm text-slate-600 truncate">Re: Request for Withholding Tax Certificate — Invoice KRL-INV-4847</div>
                      <div className="text-xs text-slate-400 mt-1">To: ar@kroll.com</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="prose prose-sm max-w-none text-xs text-slate-600">
                    <p>Hi,</p>
                    <p>Please find attached our Form 1042-S for the $30,000 withholding on invoice KRL-INV-4847. Let us know if you need anything else.</p>
                    <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">Best regards, Nakamura Holdings KK — Finance</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-mono font-semibold text-emerald-800">Form_1042-S_BW_KRL-INV-4847.pdf</span>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Proof of withholding</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-blue-900">Withholding proof received. Case ready to post to D365.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  SLA satisfied
                </h3>
                <p className="text-sm text-emerald-800">Proof of payment for the $30,000 withholding received within the 30-day window. Documentation complete.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Next action</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-700">Proceed to <strong>Approval</strong> to post the journal entry to D365 and clear the withholding receivable.</p>
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Document</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">Form 1042-S · Verified</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Nakamura Holdings Step 9: Approval */}
        {currentStep === 9 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Approval</h2>
              <p className="text-slate-600 mb-5">Kroll now displays final actions. Select an option below.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                <span className="text-xs text-slate-500">Options: Approve & Post to D365 · Create Journal Draft · Escalate to Analyst</span>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approval summary</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Case</span><span className="font-semibold text-slate-800">REM_007</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono font-semibold text-slate-800">KRL-INV-4847</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Action</span><span className="font-semibold text-slate-800">Post & send follow-up</span></div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">SLA reminder</h3>
                    <p className="text-xs text-amber-800 mt-1">After posting, $30,000 withholding proof is due within <strong>30 days</strong>.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Checklist</p>
                <ul className="text-sm text-slate-700 mt-2 space-y-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Journal entry reviewed</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Customer email sent</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Withholding proof received</li>
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> 30-day follow-up created</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Bank Fees Step 7: Approval */}
        {currentStep === 7 && processingRowId === '9' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Approval</h2>
              <p className="text-slate-600 mb-5">Review the posting and select Approve & Post to D365 below.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approval summary</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Case</span><span className="font-semibold text-slate-800">REM_009</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono font-semibold text-slate-800">KRL-INV-4890</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Action</span><span className="font-semibold text-slate-800">Post bank fee (BNK_FEE)</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Bank Fees Step 8: Resolution Completed */}
        {currentStep === 8 && processingRowId === '9' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">AI Resolution Completed Successfully</h2>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-left max-w-sm mx-auto">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800">Result</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { item: 'Invoice', status: 'Settled' },
                    { item: 'Bank fee expense', status: 'Recorded' },
                    { item: 'Customer Email', status: 'Not required' }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
                      <span className="text-slate-600">{row.item}</span>
                      <span className="font-semibold text-emerald-600">{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700">Case Status: Resolved by AI</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Dashboard</p>
                <p className="text-sm text-blue-800 mt-1">REM_009 will show as <strong>Resolved by AI</strong>. Exception queue reduced.</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Nakamura Holdings Step 10: Resolution Completed */}
        {currentStep === 10 && processingRowId === '7' && <div className="h-full flex flex-row">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 flex flex-col justify-center">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">AI Resolution Completed Successfully</h2>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-left max-w-sm mx-auto">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800">Result</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { item: 'Invoice', status: 'Settled' },
                    { item: 'Withholding Receivable', status: 'Created' },
                    { item: 'Follow-up Task', status: 'Created' },
                    { item: 'Customer Email', status: 'Sent' }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm">
                      <span className="text-slate-600">{row.item}</span>
                      <span className="font-semibold text-emerald-600">{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700">Case Status: Resolved by AI</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Follow-up & SLA</h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <p className="text-slate-700">Proof of payment for the <strong>$30,000</strong> withholding must be received within <strong>30 days</strong> of posting.</p>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Follow-up task created for documentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Customer email sent</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Dashboard</p>
                <p className="text-sm text-blue-800 mt-1">REM_007 will show as <strong>Resolved by AI</strong>. Exception queue reduced.</p>
              </div>
            </div>
          </motion.div>
        </div>}

        {/* Step 5: AI Email Draft (Harlow Crane only) */}
        {currentStep === 5 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Email Preview */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                  <User className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Human oversight from this stage onwards.</p>
                    <p className="text-xs text-amber-800 mt-0.5">An analyst will review and approve the draft email and posting plan before anything is sent or posted.</p>
                  </div>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold">Trigger:</span> Unmatched receipt where invoice references are absent or low-confidence.
                </div>
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-800">Email template: missing remittance request</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Kind of mail</span>
                      <span className="text-sm font-semibold text-slate-800">Clarification request for payment allocation</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">To</span>
                      <span className="text-sm font-semibold text-slate-800">ar@northwind.com</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">CC</span>
                      <span className="text-sm font-semibold text-slate-800">Collections team</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Subject</span>
                      <span className="text-sm font-semibold text-slate-800">Payment received — remittance details required (Ref: BOFA-883729)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-800">Email Body (AI-Generated)</h2>
                  </div>
                  <div className="p-4 prose prose-sm max-w-none text-xs">
                    <p className="text-slate-700">Dear Harlow Crane LLP,</p>
                    <p className="text-slate-700">We have received your payment of <strong>$142,500</strong> <strong>USD</strong> dated <strong>February 17, 2026</strong>. At present we&apos;re unable to match it to specific invoice(s) due to missing remittance information.</p>
                    <p className="text-slate-700">Please could you confirm which invoice numbers this payment relates to (or share remittance advice/EDI remittance detail)?</p>
                    <div className="bg-slate-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Top candidate invoices (rationale: payer similarity, partial amount patterns, date ranges)</p>
                      <ul className="text-sm text-slate-700 space-y-1">
                        <li>• INV-9912 - $100,000 (Due 10 Feb 2026)</li>
                        <li>• INV-9919 - $42,500 (Due 14 Feb 2026)</li>
                        <li>• INV-9951 - $80,000 (Due 18 Feb 2026)</li>
                        <li>• INV-9958 - $62,500 (Due 22 Feb 2026)</li>
                      </ul>
                    </div>
                    <p className="text-slate-700 mt-4">Kind regards,<br />Treasury Cash Applications</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: AI Personalization & Audit */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    AI Personalization
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Tone</span>
                      <span className="text-sm font-semibold text-slate-800">Based on previous conversations</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Language</span>
                      <span className="text-sm font-semibold text-slate-800">English (customer preference)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-700" />
                    Audit Tag
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">Outbound communication logged</p>
                    <p className="text-sm text-blue-800">Linked to Case ID → <span className="font-mono font-bold">CA-2026-00451</span></p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 mb-4">
                  <span className="font-medium text-slate-600">Human action:</span> Approve email, optionally approve posting plan. <span className="font-medium text-amber-700">Tier 1 (Draft):</span> human sends emails and posts to D365.
                </div>
                <button
                  onClick={() => {
                    setEmailSent(true);
                    toast.success('Email has been sent', {
                      description: 'Email sent to ar@northwind.com',
                      duration: 3000,
                    });
                  }}
                  disabled={emailSent}
                  className={`bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-lg w-full text-center transition-all ${emailSent
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:border-emerald-300 hover:shadow-xl active:scale-[0.98] cursor-pointer'
                    }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 ${emailSent ? 'bg-emerald-500' : 'bg-emerald-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {emailSent ? (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      ) : (
                        <Mail className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-900 mb-2">
                      {emailSent ? 'Email Sent' : 'Send Email'}
                    </h3>
                    <p className="text-sm text-emerald-700">
                      {emailSent ? 'Email successfully sent to customer' : 'Ready to send to customer'}
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 6: Awaiting Customer Response (Harlow Crane only) */}
        {currentStep === 6 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Case Status */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-amber-900">Case Status</h2>
                      <p className="text-sm text-amber-700">Awaiting customer reply</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-slate-600" />
                    SLA Tracker
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Response due in</span>
                      <span className="text-sm font-bold text-amber-600">2 business days</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Next follow-up</span>
                      <span className="text-sm font-semibold text-slate-800">Scheduled</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-slate-600" />
                    Mailbox Monitoring
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">Thread tracking → Active</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">Auto-reminder → Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Dashboard Metrics Impact */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Dashboard Metrics Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Unapplied cash</span>
                      <span className="text-sm font-bold text-amber-600">Pending resolution</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Case aging</span>
                      <span className="text-sm font-bold text-slate-800">Day 0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Email Sent</h3>
                  </div>
                  <p className="text-sm text-blue-800">Waiting for customer response. System will automatically detect and process reply.</p>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 7: Customer Response Received (Harlow Crane only) */}
        {currentStep === 7 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Inbound Email */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-emerald-900">Inbound Email Detected</h2>
                      <p className="text-sm text-emerald-700">Customer response received</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Key details shared by customer
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">Customer specified which invoices the payment should be applied to:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• INV-9912 — $100,000</li>
                    <li>• INV-9919 — $42,500</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">Total: $142,500 (matches payment amount)</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 truncate">Harlow Crane LLP AR</span>
                          <span className="text-xs text-slate-500 whitespace-nowrap">Feb 18, 9:15 AM</span>
                        </div>
                        <div className="text-sm text-slate-600 truncate">Re: Clarification required for payment $142,500</div>
                        <div className="text-xs text-slate-400 mt-1">From: ar@northwind.com</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="prose prose-sm max-w-none text-xs text-slate-600">
                      <p>Hi Kroll Team,</p>
                      <p>Please find attached the remittance advice for payment $142,500.</p>
                      <p className="mt-4">This payment should be applied to:</p>
                      <ul className="mt-2">
                        <li>INV-9912 - $100,000</li>
                        <li>INV-9919 - $42,500</li>
                      </ul>
                      <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Best regards,<br />
                        Harlow Crane LLP AR Team
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Matched via
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Thread ID
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Customer email
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Payment reference
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Attachment & AI Action */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Attachment
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">remittance_advice.pdf</p>
                      <p className="text-xs text-blue-700">PDF document</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    AI Action
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">Parsing multi-format content:</p>
                  <div className="space-y-2">
                    {['PDF', 'Email text', 'Table extraction'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 8: Parsed Response (Harlow Crane only) */}
        {currentStep === 8 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Extracted Allocation */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-emerald-900">Extracted Allocation</h2>
                      <p className="text-sm text-emerald-700">Successfully parsed from remittance</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Invoice Allocation</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'INV-9912', amount: '$100,000' },
                      { id: 'INV-9919', amount: '$42,500' }
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono font-bold text-slate-800">{inv.id}</span>
                        <span className="font-bold text-slate-800">→</span>
                        <span className="font-bold text-slate-800">{inv.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Additional Data</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Discount', value: 'None' },
                      { label: 'Withholding tax', value: 'None' },
                      { label: 'Short payment', value: 'No' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Validation & Confidence */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Agent interpretation
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    The agent parsed the customer&apos;s email and identified the key details: they shared the exact invoice numbers (INV-9912, INV-9919) and amounts ($100,000 + $42,500) that the payment should be applied to. The agent matched this information to open invoices in the system and validated that the total equals the payment amount, enabling allocation to the right invoice(s).
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Validation
                  </h3>
                  <div className="space-y-3">
                    {[
                      { check: 'Invoices exist', ok: true },
                      { check: 'Open status', ok: true },
                      { check: 'Amount reconciliation → 100%', ok: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">{item.check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Confidence</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Allocation confidence</span>
                        <span className="font-bold text-emerald-600">97%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '97%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-4">
                  <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Allocation validated</h4>
                    <p className="text-xs text-emerald-700 mt-1">All invoices verified and amounts reconciled. Ready for posting.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 9: Invoice Matching Successful (Harlow Crane only) */}
        {currentStep === 9 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Final Allocation Plan */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-emerald-900">Invoice Matching Successful</h2>
                      <p className="text-sm text-emerald-700">Final allocation plan ready</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Final Allocation Plan</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-600">Payment</span>
                        <span className="text-sm font-semibold text-slate-900">$142,500</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Applied to:</p>
                      <div className="space-y-2">
                        {[
                          { id: 'INV-9912', status: 'Cleared', amount: '$100,000' },
                          { id: 'INV-9919', status: 'Cleared', amount: '$42,500' }
                        ].map((inv, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div>
                              <span className="font-mono font-bold text-slate-800">{inv.id}</span>
                              <span className="ml-3 text-sm font-semibold text-emerald-700">→ {inv.status}</span>
                            </div>
                            <span className="font-bold text-slate-800">{inv.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Controls Passed */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Controls Passed
                  </h3>
                  <div className="space-y-3">
                    {[
                      { check: 'Tolerance → OK', ok: true },
                      { check: 'FX → Not applicable', ok: true },
                      { check: 'Duplicate check → Passed', ok: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">{item.check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-900 mb-2">Ready for Posting</h3>
                    <p className="text-sm text-emerald-700">All controls passed. Allocation validated and ready to post to D365.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 10: AI Decision - Ready for Auto Posting (Harlow Crane only) */}
        {currentStep === 10 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Ready for Auto Posting */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-emerald-900">Ready for Auto Posting</h2>
                      <p className="text-sm text-emerald-700">Automation resumed after customer input</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Resolution Type</h3>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00263A] rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">📧 AI Outreach → Autonomous completion</p>
                        <p className="text-xs text-blue-700">Customer provided allocation details via email response</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Process Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">Customer allocation received</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">Allocation validated</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">Ready for D365 posting</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 11: Posting to D365 (Harlow Crane only) */}
        {currentStep === 11 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Posting Details */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-blue-900">Posting to D365</h2>
                      <p className="text-sm text-blue-700">Writing to D365</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Posting Details</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'System', value: 'D365' },
                      { label: 'Document type', value: 'DZ' },
                      { label: 'Clearing document', value: '1800002472' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <span className="text-sm font-mono font-semibold text-slate-800 bg-slate-50 px-3 py-1 rounded border border-slate-200">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Accounting Impact */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Accounting Impact</h3>
                  <div className="space-y-3">
                    {[
                      'Customer balance updated',
                      'Unapplied cash cleared',
                      'AR aging refreshed'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <h3 className="font-bold text-blue-900">Posting in Progress</h3>
                  </div>
                  <p className="text-sm text-blue-800">Writing transaction to D365...</p>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 12: Success (Harlow Crane only) */}
        {currentStep === 12 && processingRowId === '4' && <div className="h-full flex flex-row">
          <React.Fragment>
            {/* Left: Resolution Summary */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-emerald-900">Cash Application Completed</h2>
                      <p className="text-sm text-emerald-700">Transaction successfully posted</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Resolution Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Customer', value: 'Harlow Crane LLP' },
                      { label: 'Amount', value: '$142,500' },
                      { label: 'Invoices cleared', value: '2' },
                      { label: 'Cycle type', value: 'AI autonomous with customer collaboration' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Business Impact */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Business Impact</h3>
                  <div className="space-y-3">
                    {[
                      'Unapplied cash reduced',
                      'DSO improved',
                      'Manual effort avoided'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-900 mb-2">Transaction Complete</h3>
                    <p className="text-sm text-emerald-700">Payment successfully allocated and posted to D365</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        </div>}

        {/* Step 4: Fetching Open Invoices */}
        {currentStep === 3 && <div className="h-full flex flex-row">
          {processingRowId === '9' ? (
            /* Bank Fees Step 3: Policy Check */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Policy: Bank Fees</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer / Contract Policy</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Customer', value: 'Vantage Global Advisors' },
                        { field: 'Contract ref', value: 'ALT-2024-001' },
                        { field: 'BankFeesPolicy', value: 'Absorb' },
                        { field: 'Invoice terms', value: 'Company absorbs wire fees' },
                        { field: 'Engagement letter terms', value: 'Bank-fee deductions contractually allowed (where applicable)' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Agent validates bank-fee deductions against engagement letter terms &amp; conditions to confirm whether such deductions are contractually allowed.
                    BankFeesPolicy = Absorb OR ChargeCustomer.
                  </p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      AI Decision
                    </h3>
                    <p className="text-sm text-emerald-800">Policy: <strong>Absorb</strong> — company will book bank charges as expense. No customer chargeback.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Next step</p>
                    <p className="text-sm text-blue-800 mt-1">Proceed to D365 posting preview (Option B1: expense with reason code BNK_FEE).</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '7' ? (
            /* Nakamura Holdings Step 3: Customer Tax Profile Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Customer Tax Profile</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Information</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Customer Name', value: 'Nakamura Holdings KK Ltd' },
                        { field: 'Country', value: 'United Kingdom' },
                        { field: 'Customer ID', value: 'USC-1001' },
                        { field: 'Payment Behaviour', value: 'Net payments with withholding' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tax Documentation</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { document: 'W-8BEN-E', status: 'Valid' },
                        { document: 'Treaty Status', status: 'Eligible' },
                        { document: 'Document Expiry', status: '2027' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.document}</span>
                          <span className="text-sm font-semibold text-emerald-600">{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Payment Type Classification</h3>
                    <p className="text-xs text-blue-800 mb-1">Invoice description:</p>
                    <p className="text-sm font-semibold text-blue-900">Royalty license fee</p>
                    <p className="text-xs text-blue-800 mt-3">AI tax logic:</p>
                    <p className="text-sm text-blue-800">Royalty payments to non-US entities may be subject to US withholding tax.</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Documentation SLA
                    </h3>
                    <p className="text-xs text-amber-800">Withholding proof for $30,000: <strong>30 days</strong> from settlement.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '8' ? (
            /* Castellan Step 3: Customer Tax Profile */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Customer Tax Profile</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Profile Panel</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Customer', value: 'Castellan Restructuring Ltd' },
                        { field: 'Customer ID', value: 'USC-2002' },
                        { field: 'Country', value: 'Japan' },
                        { field: 'Payment Behavior', value: 'Net payments' },
                        { field: 'Payment Type', value: 'Software Subscription' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tax Documentation</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Document</span>
                        <span className="text-xs font-semibold text-slate-900">W-8BEN-E</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Status</span>
                        <span className="text-sm font-semibold text-rose-600">Expired</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-xs text-slate-500">Expiry Date</span>
                        <span className="text-xs font-semibold text-slate-900">Jan 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Treaty Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-blue-700">Treaty Country</span><span className="font-semibold text-blue-900">Japan</span></div>
                      <div className="flex justify-between"><span className="text-blue-700">Treaty Eligibility</span><span className="font-semibold text-blue-900">Yes</span></div>
                      <div className="flex justify-between"><span className="text-blue-700">Reduced Withholding Rate</span><span className="font-semibold text-blue-900">10%</span></div>
                    </div>
                    <p className="text-xs text-blue-700 mt-3">
                      Under the US–Japan treaty, qualifying royalty and service payments may be subject to a reduced 10% withholding rate instead of the default 30%.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">AI Insight</h3>
                    <p className="text-sm text-amber-800 mb-2">
                      Customer treaty eligibility detected. However W‑8 documentation has expired, so the payer is likely applying the default 30% NRA rate.
                    </p>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Current documentation: W‑8BEN‑E (Expired Jan 2025).</li>
                      <li>Eligible treaty rate: 10% (requires valid W‑8 on file).</li>
                      <li>Risk: Potential over‑withholding of 20% on this payment.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">What this step shows</h3>
                    <p className="text-sm text-slate-700">
                      This step confirms that Castellan Restructuring Ltd should benefit from a reduced treaty rate, but missing/expired documentation prevents it.
                      The next step is to compare the expected treaty deduction ($5,000) with the actual deduction ($15,000) to quantify over‑withholding.
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '4' ? (
            /* Harlow Crane Step 3: Fetching Open Invoices */
            <React.Fragment>
              {/* Left: Invoice List */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div><span className="text-xs font-bold text-blue-600 uppercase">System</span><p className="font-bold text-blue-900 text-sm">D365</p></div>
                      <div><span className="text-xs font-bold text-blue-600 uppercase">Customer</span><p className="font-bold text-blue-900 text-sm">Harlow Crane LLP</p></div>
                      <div><span className="text-xs font-bold text-blue-600 uppercase">Open Invoices</span><p className="font-bold text-blue-900 text-sm">4 retrieved</p></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">Multiple open invoices are present.</p>
                    <p className="text-xs text-slate-600 mt-1">Payment amount: <span className="font-bold">$142,500</span></p>
                  </div>
                  <h3 className="font-bold text-slate-800">Open Invoices</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="px-4 py-3 font-mono font-bold text-slate-800">INV-9912</td><td className="px-4 py-3 font-bold text-slate-800">$100,000</td><td className="px-4 py-3 text-slate-700">10 Feb 2026</td></tr>
                        <tr><td className="px-4 py-3 font-mono font-bold text-slate-800">INV-9919</td><td className="px-4 py-3 font-bold text-slate-800">$42,500</td><td className="px-4 py-3 text-slate-700">14 Feb 2026</td></tr>
                        <tr><td className="px-4 py-3 font-mono font-bold text-slate-800">INV-9951</td><td className="px-4 py-3 font-bold text-slate-800">$80,000</td><td className="px-4 py-3 text-slate-700">18 Feb 2026</td></tr>
                        <tr><td className="px-4 py-3 font-mono font-bold text-slate-800">INV-9958</td><td className="px-4 py-3 font-bold text-slate-800">$62,500</td><td className="px-4 py-3 text-slate-700">22 Feb 2026</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span className="text-sm font-bold text-rose-900">No single invoice for $142,500</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Right: AI Matching Logic */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      Combinations matching payment ($142,500)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Two combinations match the payment amount:</p>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Combination 1</p>
                        <p className="text-sm text-slate-800">INV-9912 ($100,000) + INV-9919 ($42,500) = <span className="font-bold">$142,500</span></p>
                        <p className="text-xs text-slate-500 mt-1">Due 10 Feb, 14 Feb</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Combination 2</p>
                        <p className="text-sm text-slate-800">INV-9951 ($80,000) + INV-9958 ($62,500) = <span className="font-bold">$142,500</span></p>
                        <p className="text-xs text-slate-500 mt-1">Due 18 Feb, 22 Feb</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">No dispute ticket present</h4>
                      <p className="text-xs text-emerald-700 mt-1">No open dispute or ticket for this customer; allocation depends on remittance details only.</p>
                    </div>
                  </div>

                  <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
                    <h3 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Result
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-rose-800">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        Unable to determine allocation
                      </div>
                      <p className="text-xs text-rose-700 mt-2 leading-relaxed">
                        Multiple invoice combinations are possible (100+42.5 and 80+62.5 both equal $142,500), but no definitive match can be determined without additional remittance details.
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Manual allocation required</h4>
                      <p className="text-xs text-amber-700 mt-1">Payment cannot be automatically allocated. User intervention needed to select the correct invoice(s).</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '5' ? (
            /* Sterling Trust Bank Step 4 */
            <React.Fragment>
              {/* Left: Open Invoices */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div><span className="text-xs font-bold text-blue-600 uppercase">System</span><p className="font-bold text-blue-900 text-sm">D365</p></div>
                      <div><span className="text-xs font-bold text-blue-600 uppercase">Customer</span><p className="font-bold text-blue-900 text-sm">Sterling Trust Bank</p></div>
                      <div><span className="text-xs font-bold text-blue-600 uppercase">Open Invoices</span><p className="font-bold text-blue-900 text-sm">3 found</p></div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800">Open Invoices</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Invoice Date</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-blue-50/50 border-l-4 border-blue-400">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">KRL-INV-4432</td>
                          <td className="px-4 py-3 font-bold text-slate-800">$100,000</td>
                          <td className="px-4 py-3 text-slate-700">7 Feb 2026</td>
                          <td className="px-4 py-3 text-slate-700">9 Mar 2026</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">INV-4401</td>
                          <td className="px-4 py-3 font-bold text-slate-800">$60,000</td>
                          <td className="px-4 py-3 text-slate-700">2 Feb 2026</td>
                          <td className="px-4 py-3 text-slate-700">4 Mar 2026</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">KRL-INV-4478</td>
                          <td className="px-4 py-3 font-bold text-slate-800">$98,000</td>
                          <td className="px-4 py-3 text-slate-700">16 Feb 2026</td>
                          <td className="px-4 py-3 text-slate-700">18 Mar 2026</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500">Amount received: <span className="font-bold text-slate-700">$98,000</span></p>
                </div>
              </motion.div>
              {/* Right: Matching Signals + AI Recommendation */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Matching Signals
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Weightage and scoring can be customized based on logic.</p>
                    <div className="space-y-3">
                      {[{ text: 'Payment $98,000 = invoice $100,000 minus 2% early payment discount', score: '+45' }, { text: 'Historical payment behavior: customer avails early payment discounts (85% of invoices)', score: '+30' }, { text: 'Average days to pay (8 days) within discount window', score: '+15' }, { text: 'Single open invoice matches discounted amount', score: '+10' }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <span className="text-sm text-slate-600">{item.text}</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> AI Recommendation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-sm text-emerald-700">Suggested match</span>
                        <span className="font-mono font-bold text-emerald-900">KRL-INV-4432</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-sm text-emerald-700">Invoice amount</span>
                        <span className="font-bold text-emerald-900">$100,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                        <span className="text-sm text-emerald-700">Amount received</span>
                        <span className="font-bold text-emerald-900">$98,000</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium text-emerald-900">Reason</p>
                        <p className="text-xs text-emerald-800 mt-1">Payment of $98,000 matches invoice KRL-INV-4432 ($100,000) after 2% early payment discount. Historically the customer has availed early payment discounts (85% of invoices).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            /* Aldridge Pharma Step 4 (Original) */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase">Connected D365</span>
                        <p className="font-bold text-blue-900">D365</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase">Customer</span>
                        <p className="font-bold text-blue-900">Aldridge Pharma Group (CL-2025-0072)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-4">Open Invoices</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Due Date</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Match</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[{ id: 'KRL-INV-4845', amt: '$180,000', date: '15 Feb', match: 96, best: true },
                          { id: 'INV-7712', amt: '$95,000', date: '28 Feb', match: 12, best: false },
                          { id: 'INV-7654', amt: '$12,400', date: '10 Mar', match: 5, best: false }].map((row, i) => (
                            <tr key={i} className={row.best ? 'bg-emerald-50/50' : ''}>
                              <td className="px-4 py-3 font-semibold text-slate-700">
                                {row.id}
                                {row.best && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded font-bold">BEST</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{row.amt}</td>
                              <td className="px-4 py-3 text-slate-500 text-sm">{row.date}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${row.best ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${row.match}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-500">{row.match}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Matching Signals
                    </h3>
                    <div className="space-y-3">
                      {[{ text: 'Exact amount match ($180,000)', score: '+40' }, { text: 'Invoice number found in remittance text', score: '+35' }, { text: 'Customer ID matches invoice owner', score: '+20' }, { text: 'Currency matches (USD)', score: '+5' }].map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <span className="text-sm text-slate-600">{item.text}</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Customer Snapshot</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-xs text-slate-500 uppercase font-bold">Total AR</span>
                        <p className="text-sm font-semibold text-slate-800">$540,000</p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-lg text-center">
                        <span className="text-xs text-rose-600 uppercase font-bold">Overdue</span>
                        <p className="text-base font-semibold text-rose-700">$120,000</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500 text-center">
                      Applying this payment will reduce overdue balance by 100%
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </div>}

        {/* Step 5: AI Decision */}
        {currentStep === 4 && <div className="h-full flex flex-row">
          {processingRowId === '9' ? (
            /* Bank Fees Step 4: Resolution Recommendation */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Kroll AI Agent</h2>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      AI Decision
                    </h3>
                    <p className="text-sm text-emerald-800 mb-4">Short payment classified as bank fee (not WHT). Policy: Absorb. Invoice can be settled by posting bank charges as expense.</p>
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 mt-4">Proposed Accounting Resolution</h3>
                    <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                      <li>Apply received payment</li>
                      <li>Book bank charges expense $150 (reason code BNK_FEE)</li>
                      <li>Clear invoice KRL-INV-4890</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case at a glance</h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-semibold text-slate-800">KRL-INV-4890</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Variance</span><span className="font-semibold text-slate-800">$150 (Bank fee)</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Resolution</span><span className="font-semibold text-emerald-600">Post as expense (BNK_FEE)</span></div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Next steps</p>
                    <p className="text-sm text-blue-800 mt-1">D365 posting preview → Approval</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '7' ? (
            /* Nakamura Holdings Step 4: AI Withholding Validation */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Withholding Reasoning Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Expected Withholding Calculation</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { param: 'Invoice Amount', value: '$100,000' },
                        { param: 'Configured Rate', value: '30%' },
                        { param: 'Expected Deduction', value: '$30,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.param}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Actual Payment Difference</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { field: 'Actual Deduction', value: '$30,000' },
                        { field: 'Expected Deduction', value: '$30,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{row.field}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      AI Determination
                    </h3>
                    <p className="text-sm text-emerald-800">Observed deduction matches expected withholding rate. No discrepancy detected.</p>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
                    <p className="text-xs text-slate-500 uppercase font-bold">Confidence score</p>
                    <p className="text-sm font-semibold text-slate-800">AI Confidence: 96%</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-amber-900">SLA</p>
                    <p className="text-sm text-amber-800 mt-0.5">Proof of $30,000 withholding due within <strong>30 days</strong>.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '8' ? (
            /* Castellan Step 4: AI Withholding Analysis */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Withholding Reasoning Agent</h2>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Expected Withholding</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { param: 'Invoice Amount', value: '$50,000' },
                        { param: 'Treaty Rate', value: '10%' },
                        { param: 'Expected WHT', value: '$5,000' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.param}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Actual Deduction</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { param: 'Actual Deduction', value: '$15,000' },
                        { param: 'Actual Rate', value: '30%' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.param}</span>
                          <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-4 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Insight
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Customer applied default NRA withholding rate (30%). Treaty rate could apply if valid W‑8 documentation existed.
                    </p>
                    <div className="mt-3 bg-white/60 border border-blue-100 rounded-lg p-3 text-xs text-slate-800">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Expected (treaty)</span>
                        <span>$5,000 (10% of $50,000)</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Actual (observed)</span>
                        <span>$15,000 (30% of $50,000)</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                        <span className="font-semibold">Potential over‑withholding</span>
                        <span className="font-bold text-rose-600">$10,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Root Cause</h3>
                    <p className="text-sm text-amber-800 mb-2">
                      W‑8BEN‑E documentation is expired. Customer likely applied default 30% withholding instead of the 10% treaty rate.
                    </p>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Documentation status prevents use of reduced treaty rate.</li>
                      <li>Variance is fully explained by the higher withholding percentage.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">What this step clarifies</h3>
                    <p className="text-sm text-slate-700">
                      This step quantifies the gap between expected and actual withholding and flags a $10,000 potential over‑withholding amount
                      for human review. The next steps will propose an accounting treatment and draft communication to request updated documentation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '4' ? (
            /* Harlow Crane Step 4: AI Decision */
            <React.Fragment>
              {/* Left: Root Cause Analysis */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-rose-900">Automatic Cash Application Not Possible</h2>
                        <p className="text-sm text-rose-700">Manual intervention required</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-slate-600" />
                      Root Cause Analysis
                    </h3>
                    <div className="space-y-3">
                      {[
                        { issue: 'Missing invoice numbers', icon: XCircle },
                        { issue: 'Multiple invoice combinations possible', icon: AlertCircle },
                        { issue: 'No deduction context', icon: XCircle }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <item.icon className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-800">{item.issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Outreach Data Prepared
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Payment amount', value: '$142,500' },
                        { label: 'Payment date', value: '17 Feb 2026' },
                        { label: 'Bank reference', value: 'BOFA-883729' },
                        { label: 'Customer AR snapshot', value: '5 open invoices' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-600">{item.label}</span>
                          <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: AI Next Best Action */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-blue-900">AI Next Best Action</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-blue-800 mb-2">📧 Initiate customer outreach</h4>
                        <div className="bg-white rounded-lg p-4 space-y-2">
                          <p className="text-sm font-semibold text-slate-700">Purpose:</p>
                          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                            <li>Request allocation details</li>
                            <li>Avoid incorrect posting</li>
                            <li>Maintain audit compliance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleNextStep} className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-lg hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer w-full text-left active:scale-[0.98]">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#00263A] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2">Generate AI Email</h3>
                      <p className="text-sm text-slate-600 mb-4">AI will draft a professional email requesting allocation details</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </React.Fragment>
          ) : processingRowId === '5' ? (
            /* Sterling Trust Bank Step 5: Touchless Not Possible */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50">
                  <XCircle className="w-12 h-12 text-rose-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800 mb-2">Touchless Processing Not Possible</h2>
                <p className="text-slate-500 mb-6 max-w-sm">Ambiguous invoice match detected. User input is required to proceed.</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full max-w-sm text-left space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Allocation Summary</h3>
                  {[{ label: 'Customer', value: 'Sterling Trust Bank' }, { label: 'Payment Amount', value: '$98,000' }, { label: 'Possible Matches', value: '3' }].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">{item.label}</span>
                      <span className="font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Controls Status</h3>
                    <div className="space-y-3">
                      {[{ label: 'Customer active', ok: true }, { label: 'Invoices open', ok: true }, { label: 'Manual selection required', ok: false }].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {item.ok ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                          </div>
                          <span className={`text-sm font-medium ${item.ok ? 'text-slate-700' : 'text-amber-700'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-amber-700" /></div>
                      <h3 className="font-bold text-amber-900">Resolution Mode</h3>
                    </div>
                    <p className="text-amber-800 text-sm">User input required to select the correct invoice before posting can proceed.</p>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ) : (
            /* Aldridge Pharma Step 5 (Original) */
            <React.Fragment>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50">
                  <Zap className="w-12 h-12 text-emerald-600 fill-current" />
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">Touchless Posting</h2>
                <p className="text-slate-500 text-sm mb-5 max-w-md">AI has successfully matched payment, customer, and invoice with high confidence.</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center px-4 py-3 bg-slate-50 rounded-lg">
                    <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Confidence</span>
                    <span className="block text-4xl font-bold text-emerald-600">98%</span>
                  </div>
                  <div className="text-center px-4 py-3 bg-slate-50 rounded-lg">
                    <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Risk Level</span>
                    <span className="block text-4xl font-bold text-slate-800">Low</span>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Probabilistic intelligence</h4>
                      <p className="text-sm text-blue-700">Match confidence, ranking rationale (amount, invoice ref, customer). Learning-to-rank + calibration.</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Deterministic controls</h4>
                      <p className="text-sm text-emerald-700">Posting rules, SoD, approvals, audit. No external write until checks pass.</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">Auto-post eligible because confidence ≥ 0.97 and all control checks passed (Tier 2/3).</p>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Decision Factors</h3>
                    <div className="space-y-4">
                      {[{ title: 'Review Not Required', desc: 'Confidence score > 90% threshold set by Treasury policy.' }, { title: 'No Exceptions Found', desc: 'No deductions, short-pays, or currency mismatches identified.' }, { title: 'D365 Ready', desc: 'Customer account is active and periods are open.' }].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="mt-1 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-600" /></div>
                          <div><h4 className="font-bold text-slate-800 text-sm">{item.title}</h4><p className="text-xs text-slate-500">{item.desc}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Model diagnostics (Payment matching, last 30 days)</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Precision@1</span><span className="font-semibold text-slate-800">0.94</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Recall@k</span><span className="font-semibold text-slate-800">0.89</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Calibration error</span><span className="font-semibold text-slate-800">0.02</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">False auto-post rate</span><span className="font-semibold text-slate-800">0.4%</span></div>
                    </div>
                  </div>
                  <div className="bg-[#00263A] text-white rounded-lg p-4 shadow-lg shadow-blue-200">
                    <h3 className="font-bold text-lg mb-2">Ready to Post?</h3>
                    <p className="text-blue-100 text-sm mb-4">Proceeding will immediately clear the invoice KRL-INV-4845 in D365.</p>
                    <div className="flex items-center gap-2 text-xs font-mono bg-[#003354]/60 p-2 rounded">
                      <Loader2 className="w-3 h-3 animate-pulse" />
                      Waiting for user confirmation...
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </div>}


      </div>

      {/* Next Step Button - Always Visible Fixed Footer */}
      {(isBlueWave && currentStep === 10) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={handleBlueWaveBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back to Cash Applications
        </button>
      </div>}
      {(isNihon && currentStep === 10) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={handleNihonBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back to Cash Applications
        </button>
      </div>}
      {(isBankFee && currentStep === 8) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={handleBankFeeBackToDashboard} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back to Cash Applications
        </button>
      </div>}
      {(isBankFee && currentStep === 7) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
        <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={handleBankFeeApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <CheckCircle2 className="w-4 h-4" />
          Approve & Post to D365
        </button>
      </div>}
      {(isBlueWave && currentStep === 9) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
        <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={handleBlueWaveApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <CheckCircle2 className="w-4 h-4" />
          Approve & Post to D365
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <FileText className="w-4 h-4" />
          Create Journal Draft
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <User className="w-4 h-4" />
          Escalate to Analyst
        </button>
      </div>}
      {(isNihon && currentStep === 9) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-wrap">
        <button onClick={handlePrevStep} className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={handleNihonApproveAndPost} className="flex items-center gap-2 px-5 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          <CheckCircle2 className="w-4 h-4" />
          Approve & Post to D365
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <FileText className="w-4 h-4" />
          Create Journal Draft
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <User className="w-4 h-4" />
          Escalate to Tax Team
        </button>
      </div>}
      {!(isBlueWave && currentStep === 10) && !(isBlueWave && currentStep === 9) && !(isNihon && currentStep === 10) && !(isNihon && currentStep === 9) && !(isBankFee && currentStep === 8) && !(isBankFee && currentStep === 7) && !(isNorthwind && currentStep === 4) && !(isNorthwind && currentStep === 5 && !emailSent) && <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          {isBankFee
            ? (currentStep < 8 ? 'Next Step' : 'Complete')
            : isBlueWave
            ? 'Next Step'
            : isNorthwind
            ? (currentStep < 12 ? 'Next Step' : 'Complete')
            : (currentStep < 4 ? 'Next Step' : ((isLitware) ? 'Resolve Exception' : 'Proceed to Posting'))}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>}
    </motion.div>;
  };

  // Full flow stepper shown on exception workbench, posting, and success screens
  const FlowStepper = ({ activeStep }: { activeStep: number }) => {
    const isLitware = processingRowId === '5';
    const currentSteps = isLitware ? AI_STEPS_EXTENDED : AI_STEPS_BASE;

    return <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {currentSteps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const label = step.title.replace(/\s+/, '\n');
            return <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white ring-2 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                </div>
                <span className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 whitespace-pre-line ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {index < currentSteps.length - 1 && <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
                <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              </div>}
            </React.Fragment>;
          })}
        </div>
      </div>
    </div>;
  };

  const PostingView = () => {
    const isLitware = processingRowId === '5';
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">

      {/* Flow Stepper */}
      <FlowStepper activeStep={isLitware ? 6 : 4} />

      {/* Split Screen Content */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Panel: Posting Parameters */}
        <div className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Posting to D365</h2>
              <p className="text-slate-500">Applying payment to customer account in D365.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Posting Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Customer</span>
                  <span className="text-sm font-semibold text-slate-800">{isLitware ? 'Sterling Trust Bank (CL-2025-0156)' : 'Aldridge Pharma Group (CL-2025-0072)'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Invoice</span>
                  <span className="font-mono text-sm font-semibold text-[#00263A] bg-slate-50 px-2 py-0.5 rounded">{isLitware ? selectedInvoice : 'KRL-INV-4845'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Amount</span>
                  <span className="text-sm font-semibold text-slate-800">{isLitware ? '$98,000.00' : '$180,000.00'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Posting Date</span>
                  <span className="text-sm font-semibold text-slate-800">17 Feb 2026</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-xs">Company Code</span>
                  <span className="text-sm font-semibold text-slate-800">{isLitware ? 'KRL-EU' : 'KRL-US'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex gap-3">
                <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm mb-1">Target System</h4>
                  <p className="text-xs text-blue-700">D365</p>
                  <p className="text-xs text-blue-700 mt-1">Environment: Production ({isLitware ? 'KRL-EU Region' : 'KRL-US Region'})</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Execution Status */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto mb-5 bg-blue-50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </motion.div>

              <h3 className="text-sm font-semibold text-slate-800 mb-6">Execution Status</h3>

              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Connecting to Ledger...</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Clearing document created</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">Invoice updated to Cleared</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  </div>
                  <span className="text-blue-700 font-bold">Updating AR Balances...</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  Processing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-4 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={handlePostingComplete} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
          View Results
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>;
  };
  const SuccessView = () => {
    const isLitware = processingRowId === '5';
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">

      {/* Flow Stepper */}
      <FlowStepper activeStep={isLitware ? 7 : 5} />

      {/* Split screen */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Panel: Outcome & Actions */}
        <div className="flex-1 border-r border-slate-200 bg-white flex flex-col justify-center items-center p-5 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${isLitware ? '#f59e0b' : '#10b981'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 ${isLitware ? 'bg-amber-100' : 'bg-emerald-100'}`}
          >
            {isLitware
              ? <User className="w-12 h-12 text-amber-600" />
              : <CheckCircle2 className="w-12 h-12 text-emerald-600" />}
          </motion.div>

          <h2 className="text-base font-semibold text-slate-800 mb-2 relative z-10">
            {isLitware ? 'Cash Application Completed' : 'Cash Applied Successfully'}
          </h2>
          <p className="text-slate-500 text-sm mb-4 max-w-md relative z-10">
            {isLitware
              ? 'Resolved with AI assistance'
              : <>Payment of <span className="font-semibold text-slate-800">$180,000</span> has been posted and cleared against invoice <span className="font-semibold text-slate-800">KRL-INV-4845</span>.</>}
          </p>

          <div className={`flex items-center gap-2 px-4 py-2 border rounded-full mb-5 relative z-10 ${isLitware ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLitware ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className={`text-sm font-bold ${isLitware ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isLitware ? 'Assisted Resolution — Posted to D365' : 'Posted to D365'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-xs relative z-10">
            <button onClick={handleBackToDashboard} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Cash Applications
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              <FileText className="w-4 h-4" />
              View Journal Entry
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Download Audit Trail
            </button>
          </div>
        </div>

        {/* Right Panel: Receipt & Summary */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-4">

            {/* Transaction Record */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Transaction Record
                </h3>
                <span className="font-mono text-xs text-slate-400">{isLitware ? '#KRL-DOC-2026-4721' : '#KRL-DOC-2026-4899'}</span>
              </div>
              <div className="p-4 space-y-3">
                {isLitware ? (
                  <>
                    {[{ label: 'Customer', value: 'Sterling Trust Bank' }, { label: 'Amount', value: '$98,000.00' }, { label: 'Invoice', value: selectedInvoice }, { label: 'Document Number', value: 'KRL-DOC-2026-4721' }, { label: 'Resolution Type', value: 'Assisted' }, { label: 'Posting Date', value: 'Feb 17, 2026' }, { label: 'Company Code', value: 'KRL-EU' }].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-sm text-slate-500">{item.label}</span>
                        <span className={`font-bold text-slate-800 ${item.label === 'Resolution Type' ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Document Type</span>
                      <span className="font-medium text-slate-800">Customer Payment (DZ)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Posting Date</span>
                      <span className="font-medium text-slate-800">Feb 17, 2026</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Fiscal Period</span>
                      <span className="font-medium text-slate-800">02-2026</span>
                    </div>
                    <div className="my-4 border-t border-slate-100 border-dashed" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Amount Cleared</span>
                      <span className="font-bold text-slate-800 text-lg">$180,000.00 USD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Updated Balance</span>
                      <span className="font-bold text-emerald-600">$0.00</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Value Card */}
            <div className={`text-white rounded-lg shadow-lg p-4 relative overflow-hidden ${isLitware ? 'bg-amber-500 shadow-amber-200' : 'bg-[#00263A] shadow-slate-200'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <h3 className="font-bold uppercase tracking-wider text-xs mb-6 flex items-center gap-2 relative z-10 opacity-80">
                <Cpu className="w-4 h-4" />
                AI Value Summary
              </h3>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div>
                  <span className="block text-base font-semibold">{isLitware ? '82%' : '100%'}</span>
                  <span className="text-xs font-medium uppercase tracking-wide opacity-80">{isLitware ? 'Match Score' : 'Touchless'}</span>
                </div>
                <div>
                  <span className="block text-base font-semibold">{isLitware ? '8.4s' : '6.1s'}</span>
                  <span className="text-xs font-medium uppercase tracking-wide opacity-80">Processing</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {isLitware ? <User className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    {isLitware
                      ? 'AI identified the best invoice match and guided the user to resolve the exception efficiently.'
                      : 'Zero manual touchpoints required. This transaction has been added to the automated learning model to improve future matching.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>{/* end split screen wrapper */}

    </motion.div>;
  };
  const ExceptionWorkbenchView = () => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
    {/* Flow Stepper */}
    <FlowStepper activeStep={5} />
    {/* Header */}
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-amber-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Resolve Payment Allocation</h2>
        <p className="text-xs text-slate-500">Select the correct invoice to apply the Sterling Trust Bank payment against</p>
      </div>
      <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-amber-700">Exception — User Action Required</span>
      </div>
    </div>

    {/* Human oversight from this stage onwards */}
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 shrink-0">
      <User className="w-4 h-4 text-amber-700 flex-shrink-0" />
      <p className="text-xs text-amber-900 font-medium">
        <span className="font-semibold">Human oversight from this stage onwards.</span> An analyst is now reviewing this case and will approve the allocation before any posting.
      </p>
    </div>

    {/* Split Screen Content */}
    <div className="flex-1 flex flex-row overflow-hidden">
      {/* Left: Payment Details + Invoice Selection */}
      <div className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Payment Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Payment Details</h3>
            <div className="space-y-3">
              {[{ label: 'Customer', value: 'Sterling Trust Bank' }, { label: 'Amount', value: '$98,000' }, { label: 'Currency', value: 'USD' }].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Selection */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Select Invoice</h3>
            <div className="space-y-4">
              {[{ id: 'KRL-INV-4432', date: '9 Mar', amt: '$100,000', recommended: true }, { id: 'KRL-INV-4478', date: '18 Mar', amt: '$98,000', recommended: false }].map((inv) => (
                <button key={inv.id} onClick={() => setSelectedInvoice(inv.id)}
                  className={`w-full text-left border-2 rounded-lg p-4 transition-all ${selectedInvoice === inv.id
                    ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedInvoice === inv.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                      {selectedInvoice === inv.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-800">{inv.id}</span>
                        {inv.recommended && <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full">⭐ Recommended</span>}
                      </div>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>Due {inv.date}</span>
                        <span className="font-semibold text-slate-700">{inv.amt}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: AI Reasoning */}
      <div className="flex-1 bg-slate-50/50 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#00263A]" />
              AI Reasoning
            </h3>
            <div className="space-y-3">
              {['Closest due date to payment date', 'Highest match score (82%)', 'Matches historical payment behavior'].map((reason, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Selected Invoice</h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 text-xs">Posting against</span>
              <span className="font-mono font-semibold text-[#00263A] text-sm">{selectedInvoice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Footer */}
    <div className="bg-white border-t border-slate-200 p-4 flex justify-center gap-3 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <button onClick={handleConfirmPost} className="flex items-center gap-2 px-6 py-2 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200">
        <Check className="w-4 h-4" />
        Confirm &amp; Post
      </button>
    </div>
  </motion.div>;







  // AgentResolve Views - Adapted to Kroll styling
  const DisputeInvestigationView = ({ dispute }: { dispute: any }) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'investigation']);
    const [investigationActions, setInvestigationActions] = useState<string[]>([]);
    const [decisionMade, setDecisionMade] = useState(false);
    const [aiDecision, setAiDecision] = useState<string | null>(null);
    const [showCommunication, setShowCommunication] = useState(false);
    const [communicationSent, setCommunicationSent] = useState(false);
    const [caseClosed, setCaseClosed] = useState(false);

    useEffect(() => {
      if (investigationActions.length >= 1 && !decisionMade) {
        const timer = setTimeout(() => {
          if (dispute.touchLevel === 'high') {
            setAiDecision('escalate');
          } else if (dispute.touchLevel === 'medium') {
            setAiDecision('approve');
          } else {
            setAiDecision('approve');
          }
          setDecisionMade(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [investigationActions, decisionMade, dispute.touchLevel]);

    useEffect(() => {
      if (decisionMade && !showCommunication) {
        const timer = setTimeout(() => setShowCommunication(true), 4000);
        return () => clearTimeout(timer);
      }
    }, [decisionMade, showCommunication]);

    useEffect(() => {
      if (communicationSent && !caseClosed) {
        const timer = setTimeout(() => setCaseClosed(true), 4000);
        return () => clearTimeout(timer);
      }
    }, [communicationSent, caseClosed]);

    const toggleSection = (section: string) => {
      setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
    };

    const handleInvestigationAction = (action: string) => {
      if (!investigationActions.includes(action)) {
        setInvestigationActions(prev => [...prev, action]);
      }
    };

    const getInvestigationOptions = () => {
      if (dispute.touchLevel === 'high') {
        return [
          { id: 'contract', label: 'Review Contract Terms', icon: FileText, trigger: 'Multi-year contract dispute', color: 'purple' },
          { id: 'legal', label: 'Legal/Compliance Check', icon: Shield, trigger: 'High-value negotiation required', color: 'red' },
          { id: 'executive', label: 'Pull Executive History', icon: User, trigger: 'Strategic account review', color: 'blue' },
          { id: 'finance', label: 'Financial Impact Analysis', icon: BarChart3, trigger: 'Revenue at risk assessment', color: 'amber' }
        ];
      } else if (dispute.touchLevel === 'medium') {
        return [
          { id: 'delivery', label: 'Validate Delivery/POD', icon: Truck, trigger: 'Shipment verification needed', color: 'amber' },
          { id: 'warehouse', label: 'Check Warehouse Records', icon: Package, trigger: 'Quantity mismatch flagged', color: 'blue' },
          { id: 'payment', label: 'Pull Payment History', icon: DollarSign, trigger: 'Balance verification', color: 'purple' },
          { id: 'contact', label: 'Contact AP Department', icon: Phone, trigger: 'Customer follow-up required', color: 'emerald' }
        ];
      } else {
        return [
          { id: 'pricing', label: 'Auto-Verify Pricing', icon: DollarSign, trigger: 'Contract rate mismatch', color: 'blue' },
          { id: 'invoice', label: 'Compare Invoice to PO', icon: FileText, trigger: 'Pricing error detected', color: 'purple' },
          { id: 'history', label: 'Check Dispute History', icon: Clock, trigger: 'Pattern analysis', color: 'amber' },
          { id: 'credit', label: 'Validate Credit Terms', icon: CreditCard, trigger: 'Terms verification', color: 'emerald' }
        ];
      }
    };

    const getKeyFindings = (reason: string): string[] => {
      const findingsMap: Record<string, string[]> = {
        pricing: ['Invoiced rate: $125/unit vs Contract rate: $106.25/unit (15% difference)', 'Contract reference: AGR-2025-0456, effective Jan 2025', 'Customer has valid pricing claim based on contract terms'],
        delivery: ['Expected delivery: Nov 10, 2025 | Actual delivery: Nov 18, 2025', 'Delay: 8 business days beyond committed date', 'Customer claims financial impact due to production downtime'],
        duplicate: ['Invoice DSP-2025-003 matches previous invoice DSP-2025-001', 'Same line items, amounts, and PO number detected', 'Payment record shows DSP-2025-001 already paid on Nov 12']
      };
      return findingsMap[reason] || ['Data being analyzed...'];
    };

    const getDecisionDetails = (decision: string) => {
      if (dispute.touchLevel === 'high') {
        return { title: 'Escalate for Manual Intervention', action: `High-value $${dispute.amount.toLocaleString()} case assigned to ${dispute.assignedTo}`, status: 'ASSIGNED TO SENIOR SPECIALIST', color: '#7c3aed', icon: ArrowUpCircle };
      } else if (dispute.touchLevel === 'medium') {
        return { title: 'Approve Partial Credit - Verification Complete', action: `Credit memo for $${dispute.amount.toLocaleString()} after POD verification`, status: 'RESOLVED - PARTIAL CREDIT', color: '#2563eb', icon: CheckCircle2 };
      } else {
        return { title: 'Auto-Approved - Full Credit Issued', action: `Credit memo for $${dispute.amount.toLocaleString()} processed automatically`, status: 'RESOLVED - AUTO-APPROVED', color: '#0f766e', icon: CheckCircle2 };
      }
    };

    const investigationOptions = getInvestigationOptions();
    const aiSummary = {
      overview: `Customer ${dispute.customerName} has disputed invoice ${dispute.id} for $${dispute.amount.toLocaleString()}. The primary concern is ${dispute.reason === 'pricing' ? 'a pricing discrepancy' : dispute.reason === 'delivery' ? 'a delivery issue' : 'duplicate billing'}.`,
      confidence: dispute.aiRisk === 'high' ? 92 : dispute.aiRisk === 'medium' ? 88 : 78,
      suggestedReason: dispute.reason === 'pricing' ? 'Price Error - Contract Rate Mismatch' : dispute.reason === 'delivery' ? 'Delivery Delay - Late Shipment' : 'Duplicate Invoice',
      keyFindings: getKeyFindings(dispute.reason),
      nextBestActions: { primary: investigationOptions[0]?.label || 'Review Case', secondary: investigationOptions[1]?.label || 'Verify Details' }
    };

    const sapData = {
      invoiceNumber: dispute.id,
      invoiceDate: dispute.createdDate,
      dueDate: dispute.dueDate,
      amount: dispute.amount,
      currency: 'USD',
      paymentTerms: 'Net 30',
      poNumber: 'PO-' + Math.floor(Math.random() * 100000),
      customerNumber: 'CUST-' + Math.floor(Math.random() * 10000)
    };

    const customerInfo = {
      name: dispute.customerName,
      accountNumber: sapData.customerNumber,
      totalDisputes: Math.floor(Math.random() * 10) + 3,
      resolvedDisputes: Math.floor(Math.random() * 8) + 2,
      avgDisputeAmount: '$' + (Math.floor(Math.random() * 20000) + 5000).toLocaleString(),
      sentiment: dispute.aiRisk === 'high' ? 'Frustrated' : dispute.aiRisk === 'medium' ? 'Concerned' : 'Professional',
      sentimentScore: dispute.aiRisk === 'high' ? 35 : dispute.aiRisk === 'medium' ? 65 : 85
    };

    const attachments = [
      { name: `Invoice-${dispute.id}.pdf`, type: 'Invoice', size: '245 KB' },
      { name: 'Purchase-Order.pdf', type: 'Purchase Order', size: '189 KB' },
      { name: 'Contract-Agreement.pdf', type: 'Contract', size: '512 KB' }
    ];

    return <div className="space-y-6">
      {/* AI Summary Section - Dispute Triage & Routing Agent */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
        <button onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider block">Dispute Triage &amp; Routing Agent</span>
              <h3 className="text-slate-800 font-semibold">AI-Generated Dispute Summary</h3>
            </div>
          </div>
          {expandedSections.includes('summary') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('summary') && (
          <div className="p-5 pt-0 space-y-4">
            <p className="text-slate-800">{aiSummary.overview}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-slate-500 uppercase font-semibold">AI Confidence Score</p>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${aiSummary.confidence >= 70 ? 'bg-emerald-500' : aiSummary.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${aiSummary.confidence}%` }}></div>
                  </div>
                  <span className="text-slate-800 font-semibold">{aiSummary.confidence}%</span>
                </div>
                <p className="text-xs text-slate-500">{aiSummary.confidence >= 70 ? 'High confidence - Strong evidence' : aiSummary.confidence >= 50 ? 'Medium confidence - Review suggested' : 'Low confidence - Investigation needed'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Suggested Reason Code</p>
                <p className="text-slate-800 font-semibold">{aiSummary.suggestedReason}</p>
              </div>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Key Findings</p>
              <ul className="space-y-2">
                {aiSummary.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-3">AI Suggested Next Best Actions</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-700">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-semibold text-sm">{aiSummary.nextBestActions.primary}</p>
                    <p className="text-xs text-emerald-700">Primary recommendation</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-semibold text-sm">{aiSummary.nextBestActions.secondary}</p>
                    <p className="text-xs text-blue-700">Follow-up action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investigation Actions */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <button onClick={() => toggleSection('investigation')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <h3 className="text-slate-800 font-semibold">Investigation Actions</h3>
          {expandedSections.includes('investigation') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('investigation') && (
          <div className="p-5 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investigationOptions.map((option) => {
                const Icon = option.icon;
                const isActive = investigationActions.includes(option.id);
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600',
                  purple: 'bg-purple-100 text-purple-600',
                  amber: 'bg-amber-100 text-amber-600',
                  red: 'bg-red-100 text-red-600',
                  emerald: 'bg-emerald-100 text-emerald-600'
                };

                return (
                  <button
                    key={option.id}
                    onClick={() => handleInvestigationAction(option.id)}
                    disabled={isActive}
                    className={`flex items-start gap-3 p-4 border rounded-lg transition-all text-left ${isActive
                      ? 'border-emerald-500 bg-emerald-50 cursor-default'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${isActive ? 'bg-emerald-100' : colorClasses[option.color] || 'bg-blue-100'}`}>
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Icon className={`w-5 h-5 ${option.color === 'blue' ? 'text-blue-600' : option.color === 'purple' ? 'text-purple-600' : option.color === 'amber' ? 'text-amber-600' : option.color === 'red' ? 'text-red-600' : 'text-emerald-600'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-semibold mb-1">{option.label}</p>
                      <p className="text-xs text-slate-500">Trigger: {option.trigger}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SAP Data */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <button onClick={() => toggleSection('sap')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-slate-800 font-semibold">SAP Invoice Data</h3>
          </div>
          {expandedSections.includes('sap') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('sap') && (
          <div className="p-5 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(sapData).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-slate-800 font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Thread */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <button onClick={() => toggleSection('email')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-slate-800 font-semibold">Customer Email Communication</h3>
          </div>
          {expandedSections.includes('email') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('email') && (
          <div className="p-5 pt-0">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00263A] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold">{dispute.customerName}</p>
                    <p className="text-xs text-slate-500">to disputes@kroll.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{dispute.createdDate}</p>
                  <p className="text-xs text-slate-500">09:15 AM</p>
                </div>
              </div>
              <p className="text-sm text-slate-800 font-semibold mb-2">Subject: Dispute for Invoice {dispute.id}</p>
              <p className="text-sm text-slate-600 mb-3">{dispute.description}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">AI Sentiment:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customerInfo.sentiment === 'Frustrated' ? 'bg-red-50 text-red-700' :
                  customerInfo.sentiment === 'Concerned' ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                  {customerInfo.sentiment}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer History */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <button onClick={() => toggleSection('customer')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-slate-800 font-semibold">Customer Account History & Sentiment</h3>
          </div>
          {expandedSections.includes('customer') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('customer') && (
          <div className="p-5 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Customer Name</p>
                  <p className="text-slate-800 font-medium">{customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Account Number</p>
                  <p className="text-slate-800 font-medium">{customerInfo.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Disputes</p>
                  <p className="text-slate-800 font-medium">{customerInfo.totalDisputes} ({customerInfo.resolvedDisputes} resolved)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Avg Dispute Amount</p>
                  <p className="text-slate-800 font-medium">{customerInfo.avgDisputeAmount}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Sentiment Analysis</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-800 font-semibold">{customerInfo.sentiment}</span>
                    <span className="text-slate-800 font-semibold">{customerInfo.sentimentScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${customerInfo.sentimentScore >= 70 ? 'bg-emerald-500' : customerInfo.sentimentScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${customerInfo.sentimentScore}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    {customerInfo.sentimentScore >= 70 ? 'Customer maintains professional tone and has good dispute resolution history.' : customerInfo.sentimentScore >= 50 ? 'Customer shows signs of concern but remains communicative.' : 'Customer exhibits frustration. Consider priority handling and escalation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <button onClick={() => toggleSection('attachments')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-slate-800 font-semibold">Extracted Attachments ({attachments.length})</h3>
          </div>
          {expandedSections.includes('attachments') ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
        </button>
        {expandedSections.includes('attachments') && (
          <div className="p-5 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((attachment, i) => (
                <button key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500">{attachment.type} • {attachment.size}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Decision */}
      {decisionMade && aiDecision && (
        <div className="bg-slate-50 border-2 border-[#00263A] rounded-lg overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
          <div className="bg-[#00263A] p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Agent Decision</h3>
                <p className="text-white/80 text-xs">Autonomous AI decision based on investigation</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const DecisionIcon = getDecisionDetails(aiDecision).icon;
                  return <DecisionIcon className="w-5 h-5 flex-shrink-0" style={{ color: getDecisionDetails(aiDecision).color }} />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-semibold">{getDecisionDetails(aiDecision).title}</p>
                  <p className="text-xs text-slate-600">{getDecisionDetails(aiDecision).action}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: `${getDecisionDetails(aiDecision).color}20`, color: getDecisionDetails(aiDecision).color }}>
                  {getDecisionDetails(aiDecision).status}
                </span>
              </div>
            </div>
            <div className={`rounded-lg p-4 ${dispute.touchLevel === 'high' ? 'bg-red-50 border-l-4 border-red-600' : dispute.touchLevel === 'medium' ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-emerald-50 border-l-4 border-emerald-600'}`}>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-bold flex-shrink-0 ${dispute.touchLevel === 'high' ? 'bg-red-600 text-white' : dispute.touchLevel === 'medium' ? 'bg-[#003354] text-white' : 'bg-emerald-600 text-white'}`}>
                  {dispute.touchLevel === 'high' ? 'HIGH TOUCH' : dispute.touchLevel === 'medium' ? 'MEDIUM TOUCH' : 'LOW TOUCH'}
                </span>
                <span className={`text-sm font-medium ${dispute.touchLevel === 'high' ? 'text-red-900' : dispute.touchLevel === 'medium' ? 'text-blue-900' : 'text-emerald-900'}`}>
                  {dispute.touchLevel === 'high' ? `$${dispute.amount.toLocaleString()} case assigned to ${dispute.assignedTo}` : aiDecision === 'approve' ? `Evidence validated. Credit memo issued.` : `Escalated for review.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication & Documentation */}
      {showCommunication && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-600 rounded-lg overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
          <div className="bg-[#00263A] p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Communication & Documentation</h3>
                <p className="text-white/80 text-xs">System auto-creates all necessary documents</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Audit Trail Entry', 'Customer Email Draft', 'D365 Dispute Notes', 'D365 Timeline Update'].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-semibold">{item}</p>
                    <p className="text-xs text-slate-500">Auto-generated compliance record</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 uppercase font-semibold">Customer Email Preview</p>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
              <div className="bg-slate-50 rounded p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">To:</span>
                  <span className="text-slate-800">{dispute.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Subject:</span>
                  <span className="text-slate-800">Resolution: Invoice {dispute.id} Dispute</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-slate-800">
                    Dear {dispute.customerName},<br /><br />
                    Thank you for bringing invoice {dispute.id} to our attention. After thorough review of your claim and supporting documentation, we have {aiDecision === 'approve' ? `approved your dispute and will be issuing a credit memo for $${dispute.amount.toLocaleString()}` : `determined that additional documentation is required to process your claim`}.<br /><br />
                    {aiDecision === 'approve' ? 'The credit will be applied to your account within 3-5 business days.' : 'Please provide the requested documentation at your earliest convenience.'}<br /><br />
                    Best regards,<br />Dispute Resolution Team
                  </p>
                </div>
              </div>
            </div>
            {!communicationSent && (
              <div className="flex justify-end">
                <button onClick={() => setCommunicationSent(true)} className="flex items-center gap-2 px-6 py-3 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] hover:shadow-lg transition-all font-semibold">
                  <Send className="w-4 h-4" />
                  Review & Send Communication
                </button>
              </div>
            )}
            {communicationSent && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Communication sent successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Closure */}
      {caseClosed && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-600 rounded-lg overflow-hidden shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
          <div className="bg-emerald-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Step 7: Case Closure</h3>
                <p className="text-white/80 text-xs">Dispute resolved and case finalized</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Closure Conditions Met</p>
              <div className="space-y-2">
                {[aiDecision === 'approve' ? 'Credit memo posted to SAP' : 'Customer accepted final resolution', 'Customer acknowledgment received', 'All documentation archived'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-3">System Actions Completed</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Record Locked', 'Compliance Metadata', 'SLA Result', 'Analytics Logged'].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    {i === 0 ? <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> :
                      i === 1 ? <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> :
                        i === 2 ? <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> :
                          <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm text-slate-800 font-semibold">{item}</p>
                      <p className="text-xs text-slate-500">{i === 2 ? '✓ Met - Resolved on time' : 'Completed'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Final Status</p>
                    <p className="text-slate-800 font-semibold text-lg">CLOSED</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Closed on</p>
                  <p className="text-sm text-slate-800 font-medium">Nov 25, 2025</p>
                  <p className="text-xs text-slate-500">02:45 PM</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-slate-800 font-semibold mb-1">Dispute Successfully Resolved</p>
              <p className="text-sm text-slate-600">This case has been fully processed by the AI agent and is now closed. All stakeholders have been notified.</p>
            </div>
          </div>
        </div>
      )}
    </div>;
  };

  const DisputeDetailView = ({ dispute, onClose }: { dispute: any; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'workflow' | 'investigation' | 'details'>('workflow');
    const [workflowComplete, setWorkflowComplete] = useState(false);
    const [visibleSteps, setVisibleSteps] = useState(1);
    const [loadingSteps, setLoadingSteps] = useState(0);

    useEffect(() => {
      const timers: NodeJS.Timeout[] = [];
      for (let i = 2; i <= 4; i++) {
        const loadingTimer = setTimeout(() => setLoadingSteps(i), (i - 1) * 1500 + 300);
        timers.push(loadingTimer);
        const timer = setTimeout(() => {
          setVisibleSteps(i);
          setLoadingSteps(0);
          if (i === 4) {
            setWorkflowComplete(true);
          }
        }, (i - 1) * 1500 + 1500);
        timers.push(timer);
      }
      return () => timers.forEach(t => clearTimeout(t));
    }, []);

    const mockEmail = {
      from: `${dispute.customerName.toLowerCase().replace(/ /g, '.')}@kroll-client.com`,
      subject: `Dispute for Invoice ${dispute.id}`,
      date: dispute.createdDate,
      fullBody: `Dear Support Team,\n\nI am writing to dispute invoice ${dispute.id} dated ${dispute.createdDate}.\n\n${dispute.description}\n\nI have attached all relevant documentation for your review. Please address this matter urgently.\n\nBest regards,\n${dispute.customerName}`
    };

    const categoryMap: Record<string, string> = { pricing: 'Pricing Error', delivery: 'Delivery Issue', duplicate: 'Duplicate Billing' };
    const teamMap: Record<string, string> = { pricing: 'Finance - Pricing', delivery: 'Logistics', duplicate: 'Finance - Billing' };
    const attachmentMap: Record<string, Array<{ name: string; type: string }>> = {
      pricing: [{ name: `Invoice-${dispute.id}.pdf`, type: 'Invoice' }, { name: 'Contract-Agreement.pdf', type: 'Contract' }, { name: 'Price-Quote.pdf', type: 'Quote' }],
      delivery: [{ name: `Invoice-${dispute.id}.pdf`, type: 'Invoice' }, { name: 'Shipping-Manifest.pdf', type: 'Proof of Delivery' }],
      duplicate: [{ name: `Invoice-${dispute.id}.pdf`, type: 'Invoice' }, { name: 'Previous-Invoice.pdf', type: 'Invoice' }]
    };

    const extractedData = {
      invoiceId: dispute.id,
      amount: dispute.amount,
      customerName: dispute.customerName,
      customerLifetimeValue: dispute.amount * 8.5,
      annualRevenue: dispute.amount * 12,
      region: 'North America',
      currency: 'USD',
      accountManager: dispute.assignedTo
    };

    const processingResult = {
      category: categoryMap[dispute.reason] || 'General Inquiry',
      priority: dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1),
      slaTime: dispute.priority === 'critical' ? '12 hours' : dispute.priority === 'high' ? '24 hours' : '48 hours',
      assignedTeam: teamMap[dispute.reason] || 'General Support',
      assignedAgent: dispute.assignedTo
    };

    const caseData = {
      id: dispute.id,
      status: 'Assigned',
      reasonHints: dispute.reason === 'pricing' ? ['Price discrepancy claimed', 'Contract rate reference', 'Overcharge amount calculated', 'Requires contract review'] : ['Delivery delay reported', 'Financial loss claimed'],
      attachments: attachmentMap[dispute.reason] || [{ name: `Invoice-${dispute.id}.pdf`, type: 'Invoice' }]
    };

    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">
      <div className="mb-6">
        <button onClick={onClose} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back to Disputes</span>
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Dispute #{dispute.id}</h2>
          <p className="text-slate-500 text-sm mt-1">{dispute.customerName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
        <button onClick={() => setActiveTab('workflow')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'workflow' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <Zap className="w-4 h-4" />
          <span className="font-semibold">AI Workflow</span>
        </button>
        <button onClick={() => setActiveTab('investigation')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'investigation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <FileText className="w-4 h-4" />
          <span className="font-semibold">AI Investigation</span>
        </button>
        <button onClick={() => setActiveTab('details')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">Details & Activity</span>
        </button>
      </div>

      {activeTab === 'workflow' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            {/* Step 1: Customer Email */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#00263A] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">1. Customer Email</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">From:</span><span className="text-slate-800 truncate">{mockEmail.from}</span></div>
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">To:</span><span className="text-slate-800">disputes@kroll.com</span></div>
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">Subject:</span><span className="text-slate-800">{mockEmail.subject}</span></div>
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">Date:</span><span className="text-slate-600">{mockEmail.date}</span></div>
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">Priority:</span><span className="text-red-600 font-semibold">High</span></div>
                <div className="flex items-start gap-2"><span className="text-slate-500 font-semibold min-w-[40px]">Attachments:</span><span className="text-slate-800">3 files attached</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-semibold">Complete</span>
              </div>
            </div>

            {/* Step 2: AI Data Extraction */}
            <div className={`bg-white border border-slate-200 rounded-lg p-4 transition-all ${visibleSteps >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#00263A] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">2. AI Data Extraction</h4>
              </div>
              {loadingSteps === 2 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-600">AI Extracting Data...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {[{ icon: FileText, label: 'Invoice ID', value: extractedData.invoiceId, color: 'text-blue-600' },
                    { icon: DollarSign, label: 'Amount', value: `$${extractedData.amount.toLocaleString()}`, color: 'text-emerald-600' },
                    { icon: User, label: 'Customer', value: extractedData.customerName, color: 'text-blue-600' },
                    { icon: AlertCircle, label: 'CLTV', value: `$${extractedData.customerLifetimeValue.toLocaleString()}`, color: 'text-purple-600' },
                    { icon: DollarSign, label: 'Annual Revenue', value: `$${extractedData.annualRevenue.toLocaleString()}`, color: 'text-emerald-600' },
                    { icon: User, label: 'Account Manager', value: extractedData.accountManager, color: 'text-indigo-600' },
                    { icon: Globe, label: 'Region / Currency', value: `${extractedData.region} / ${extractedData.currency}`, color: 'text-sky-600' }].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">{item.label}</p>
                            <p className="text-xs text-slate-800 font-semibold truncate">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-semibold">8 fields extracted</span>
                  </div>
                </>
              )}
            </div>

            {/* Step 3: System Processing */}
            <div className={`bg-white border border-slate-200 rounded-lg p-4 transition-all ${visibleSteps >= 3 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#00263A] flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">3. System Processing</h4>
              </div>
              {loadingSteps === 3 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-600">AI Processing Data...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {[{ icon: FileText, label: 'Category', value: processingResult.category, color: 'text-blue-600' },
                    { icon: AlertCircle, label: 'Priority Level', value: processingResult.priority, color: 'text-red-600' },
                    { icon: Clock, label: 'SLA Time', value: processingResult.slaTime, color: 'text-blue-600' },
                    { icon: User, label: 'Routed To', value: processingResult.assignedTeam, subValue: `Agent: ${processingResult.assignedAgent}`, color: 'text-purple-600' }].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-semibold">{item.label}</p>
                            <p className="text-xs text-slate-800 font-semibold">{item.value}</p>
                            {item.subValue && <p className="text-xs text-slate-500">{item.subValue}</p>}
                          </div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-semibold">Complete</span>
                  </div>
                </>
              )}
            </div>

            {/* Step 4: Case Metadata */}
            <div className={`bg-white border border-slate-200 rounded-lg p-4 transition-all ${visibleSteps >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">4. Case Metadata</h4>
              </div>
              {loadingSteps === 4 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-600">AI Generating Metadata...</p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertCircle className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Extracted from SAP</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Case ID</p>
                          <p className="text-xs text-slate-800 font-semibold">{caseData.id}</p>
                        </div>
                        <div className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
                          <span className="text-xs font-semibold text-emerald-700">{caseData.status}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-2">Reason Hints</p>
                      <div className="space-y-1">
                        {caseData.reasonHints.map((hint, i) => (
                          <div key={i} className="flex items-start gap-1 bg-slate-50 rounded px-2 py-1">
                            <ArrowRight className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-800">{hint}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-2">Attachments</p>
                      <div className="space-y-1">
                        {caseData.attachments.map((att, i) => (
                          <button key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded w-full text-left hover:bg-blue-50 transition-all">
                            <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate text-blue-600">{att.name}</p>
                              <p className="text-xs text-slate-500">{att.type}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-semibold">Complete</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {workflowComplete && (
            <div className="mt-8 flex justify-center">
              <button onClick={() => setActiveTab('investigation')} className="flex items-center gap-2 px-8 py-3 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-all font-semibold shadow-md">
                <FileText className="w-5 h-5" />
                <span>Start AI Investigation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'investigation' && (
        <DisputeInvestigationView dispute={dispute} />
      )}

      {activeTab === 'details' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">CUSTOMER</p>
              <p className="text-slate-800 font-semibold">{dispute.customerName}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">DISPUTED AMOUNT</p>
              <p className="text-sm font-semibold text-[#00263A]">${dispute.amount.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">ASSIGNED TO</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00263A] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-800 font-semibold">{dispute.assignedTo}</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-slate-800 mb-3 font-semibold">Description</h4>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-slate-800">{dispute.description}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>;
  };

  const DisputesView = () => {
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [disputes] = useState([
      { id: 'DSP-2025-003', customerName: 'Pinnacle Capital Partners LLC', amount: 480000, assignedTo: 'James Wilson (Senior Specialist)', createdDate: 'Nov 24, 2025', dueDate: 'Nov 26, 2025', description: 'Billing dispute across multi-matter Valuation Advisory engagement KRL-MAT-2025-0847. Client contests $480K in fees citing scope creep on portfolio company valuations. Requires negotiation, legal/contract review, and cross-functional involvement (engagement partner, finance, legal). Dunning on hold.', touchLevel: 'high' as const, reason: 'pricing' as const, priority: 'critical' as const, aiRisk: 'high' as const, sla: 'breach' as const, status: 'escalated' as const },
      { id: 'DSP-2025-002', customerName: 'Aldridge Capital Group', amount: 42500, assignedTo: 'Michael Scott (Senior Specialist)', createdDate: 'Nov 25, 2025', dueDate: 'Nov 27, 2025', description: 'Scope-of-work discrepancy on Transaction Advisory engagement KRL-MAT-2025-0712. Client disputes billable hours on financial due diligence phase. Engagement partner review and SOW amendment required.', touchLevel: 'medium' as const, reason: 'pricing' as const, priority: 'medium' as const, aiRisk: 'low' as const, sla: 'healthy' as const, status: 'in_progress' as const },
      { id: 'DSP-2025-001', customerName: 'Sterling Trust Advisors', amount: 18750, assignedTo: 'Sarah Chen', createdDate: 'Nov 26, 2025', dueDate: 'Nov 27, 2025', description: 'Client disputes KRL-INV-4719 — claims agreed rate for Restructuring Advisory retainer was 12% lower than invoiced. Rate card reconciliation with engagement team needed.', touchLevel: 'low' as const, reason: 'pricing' as const, priority: 'high' as const, aiRisk: 'medium' as const, sla: 'healthy' as const, status: 'in_progress' as const }
    ]);

    if (selectedDispute) {
      return <DisputeDetailView dispute={selectedDispute} onClose={() => setSelectedDispute(null)} />;
    }

    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">
      <div className="mb-5"><h2 className="text-base font-semibold text-slate-800">All Disputes</h2><p className="text-slate-500 text-sm mt-1">Dispute Triage &amp; Routing Agent classifies disputes (pricing, duplicate billing, chargeback, etc.) and routes with evidence. Auto-route ≥ 0.92 for top categories; else escalate.</p></div>
      <div className="space-y-4">{disputes.map((d) => <div key={d.id} onClick={() => setSelectedDispute(d)} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all">
        <div className="flex items-start justify-between mb-4"><div className="flex-1"><h4 className="text-slate-800 font-mono text-sm mb-2">{d.id}</h4><h3 className="text-slate-800 font-semibold text-base mb-2">{d.customerName}</h3><p className="text-slate-600 text-sm">{d.description}</p></div>
          <div className="ml-6"><p className="text-xs text-slate-500 mb-1">AMOUNT</p><p className="text-sm font-semibold text-[#00263A]">${d.amount.toLocaleString()}</p></div></div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-200"><div className="flex items-center gap-4"><div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-4 h-4 text-slate-400" /><span>{d.assignedTo}</span></div><div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /><span>{d.createdDate}</span></div></div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.touchLevel === 'high' ? 'bg-red-50 text-red-700 border border-red-200' : d.touchLevel === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{d.touchLevel === 'high' ? 'High Touch' : d.touchLevel === 'medium' ? 'Medium Touch' : 'Low Touch'}</span></div></div>)}</div>
    </motion.div>;
  };
  const PromiseToPayView = () => {
    const [selectedEmail, setSelectedEmail] = useState<IncomingEmail | null>(null);
    const [currentStep, setCurrentStep] = useState<'viewing' | 'extracting' | 'linking' | 'enriching' | 'scoring' | 'complete'>('viewing');
    const [extractedData, setExtractedData] = useState<ExtractionData | null>(null);
    const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
    const [scoringData, setScoringData] = useState<PtpScoringData | null>(null);
    const [confidenceScore, setConfidenceScore] = useState<number>(0);
    const [showProcessing, setShowProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'incoming' | 'records'>('incoming');
    const [selectedAction, setSelectedAction] = useState<{ recordId: string; action: string } | null>(null);
    const [isProcessingOnPage, setIsProcessingOnPage] = useState(false);

    const mockEmails: IncomingEmail[] = [
      {
        id: "EMAIL-001",
        from: "ap@pinnaclecp.com",
        subject: "Re: Invoice KRL-INV-4831 – Payment schedule",
        body: `Hi,

We confirm that payment for KRL-INV-4831 (USD 48,500) — Valuation Advisory retainer for matter KRL-MAT-2025-0901 — will be released on 15 Dec 2025, once internal approval is completed by our CFO.

Regards,
AP Team
Pinnacle Capital Partners LLC`,
        receivedDate: "2025-11-26T09:15:00",
        isProcessed: false
      },
      {
        id: "EMAIL-002",
        from: "finance@aldridgecapital.com",
        subject: "Payment Confirmation - Invoice KRL-INV-4799",
        body: `Dear Team,

This is to confirm that we will process payment for Invoice KRL-INV-4799 amounting to EUR 12,300 — Transaction Advisory services, matter KRL-MAT-2025-0744 — by December 5th, 2025. Our finance team has already approved this payment.

Best regards,
Finance Department
Aldridge Capital Group`,
        receivedDate: "2025-11-25T14:22:00",
        isProcessed: false
      },
      {
        id: "EMAIL-003",
        from: "accounting@meridianpe.com",
        subject: "Re: Outstanding Invoice KRL-INV-4756",
        body: `Hello,

Regarding Invoice KRL-INV-4756 for $76,000 — Restructuring Advisory for portfolio company Argos Holdings — we're working on getting this approved internally. We'll try to make a payment by November 20th, but there might be some delays due to fund-level approval processes.

Thanks,
Accounting Team
Meridian Private Equity`,
        receivedDate: "2025-11-24T11:05:00",
        isProcessed: false
      },
      {
        id: "EMAIL-004",
        from: "payables@horizonrestructuring.co.uk",
        subject: "Invoice KRL-INV-4712 - Payment Update",
        body: `Hi there,

We received your invoice KRL-INV-4712 for Cyber Risk Advisory services. We're reviewing the engagement scope internally and need a few more days before we can confirm the payment date.

Regards,
Horizon Restructuring Ltd — Payables`,
        receivedDate: "2025-11-23T16:40:00",
        isProcessed: false
      },
      {
        id: "EMAIL-005",
        from: "ap@sterlingmgt.com",
        subject: "Re: Invoice KRL-INV-4688",
        body: `Good afternoon,

We have received invoice KRL-INV-4688 for USD 18,200 — Financial Crime Compliance advisory, matter KRL-MAT-2025-0698. Based on our payment cycle, this should be processed by the end of November 2025.

Thank you,
AP Department
Sterling Asset Management`,
        receivedDate: "2025-11-22T10:30:00",
        isProcessed: false
      }
    ];

    const initialPtpRecords: PtpRecord[] = [
      {
        id: 'PTP-10001',
        customer: 'Aldridge Capital Group',
        invoice: 'KRL-INV-4799',
        amount: 12300,
        currency: 'EUR',
        commitment_date: '2025-12-05',
        commitment_text: 'Will pay on 05 Dec — finance team approved',
        predicted_pay_date: '2025-12-05',
        confidence_score: 93,
        risk_level: 'Low',
        ptp_type: 'Customer-declared',
        owner: 'Collector – Maria S',
        last_interaction: 'Email',
        sentiment: 'Positive',
        recommended_action: 'No immediate action – monitor only',
        created_date: '2025-11-25T14:30:00',
        history_total: 5,
        history_kept: 5,
        history_broken: 0,
        ageing: '30-60 days',
        status: 'Active'
      },
      {
        id: 'PTP-10002',
        customer: 'Meridian Private Equity',
        invoice: 'KRL-INV-4756',
        amount: 76000,
        currency: 'USD',
        commitment_date: '2025-11-20',
        commitment_text: 'Payment by 20 Nov — fund-level approval pending',
        predicted_pay_date: null,
        confidence_score: 32,
        risk_level: 'High',
        ptp_type: 'Customer-declared',
        owner: 'Collector – James K',
        last_interaction: 'Email',
        sentiment: 'Neutral',
        recommended_action: 'Escalate to Senior Collector; engagement partner to follow up',
        created_date: '2025-11-24T11:15:00',
        history_total: 8,
        history_kept: 3,
        history_broken: 5,
        ageing: '90+ days',
        status: 'Active'
      },
      {
        id: 'PTP-10003',
        customer: 'Horizon Restructuring Ltd',
        invoice: 'KRL-INV-4712',
        amount: 45200,
        currency: 'GBP',
        commitment_date: null,
        commitment_text: 'Reviewing scope internally — will confirm payment date shortly',
        predicted_pay_date: null,
        confidence_score: 18,
        risk_level: 'Critical',
        ptp_type: 'Vague-declared',
        owner: 'Collector – Sarah L',
        last_interaction: 'Email',
        sentiment: 'Cautious',
        recommended_action: 'Call within 24 hours; engage legal if no response by week end',
        created_date: '2025-11-23T16:50:00',
        history_total: 4,
        history_kept: 1,
        history_broken: 3,
        ageing: '60-90 days',
        status: 'Active'
      },
      {
        id: 'PTP-10004',
        customer: 'Sterling Asset Management',
        invoice: 'KRL-INV-4688',
        amount: 18200,
        currency: 'USD',
        commitment_date: '2025-11-30',
        commitment_text: 'Based on payment cycle, should be processed by end of Nov',
        predicted_pay_date: '2025-11-30',
        confidence_score: 70,
        risk_level: 'Medium',
        ptp_type: 'Inferred',
        owner: 'Collector – David R',
        last_interaction: 'Email',
        sentiment: 'Positive',
        recommended_action: 'Flag as inferred; human review suggested',
        created_date: '2025-11-22T10:40:00',
        history_total: 6,
        history_kept: 5,
        history_broken: 1,
        ageing: '30-60 days',
        status: 'Active'
      }
    ];

    const [ptpRecords, setPtpRecords] = useState<PtpRecord[]>(initialPtpRecords);

    // Mock extraction data based on email ID
    const getExtractionData = (emailId: string): ExtractionData => {
      const extractionMap: { [key: string]: ExtractionData } = {
        "EMAIL-001": {
          customer_name: "Pinnacle Capital Partners LLC",
          email: "ap@pinnaclecp.com",
          invoice_numbers: ["KRL-INV-4831"],
          promised_amount: 48500,
          currency: "USD",
          promised_date: "2025-12-15",
          free_text_notes: "once internal approval is completed by our CFO",
          sentiment: "Positive",
          tone: "Polite, confident"
        },
        "EMAIL-002": {
          customer_name: "Aldridge Capital Group",
          email: "finance@aldridgecapital.com",
          invoice_numbers: ["KRL-INV-4799"],
          promised_amount: 12300,
          currency: "EUR",
          promised_date: "2025-12-05",
          free_text_notes: "finance team has already approved",
          sentiment: "Positive",
          tone: "Professional, confident"
        },
        "EMAIL-003": {
          customer_name: "Meridian Private Equity",
          email: "accounting@meridianpe.com",
          invoice_numbers: ["KRL-INV-4756"],
          promised_amount: 76000,
          currency: "USD",
          promised_date: "2025-11-20",
          free_text_notes: "delays due to fund-level approval processes",
          sentiment: "Non-committal",
          tone: "Uncertain, vague"
        },
        "EMAIL-004": {
          customer_name: "Horizon Restructuring Ltd",
          email: "payables@horizonrestructuring.co.uk",
          invoice_numbers: ["KRL-INV-4712"],
          promised_amount: 29950,
          currency: "GBP",
          promised_date: null,
          free_text_notes: "reviewing engagement scope internally",
          sentiment: "Vague",
          tone: "Non-committal"
        },
        "EMAIL-005": {
          customer_name: "Sterling Asset Management",
          email: "ap@sterlingmgt.com",
          invoice_numbers: ["KRL-INV-4688"],
          promised_amount: 18200,
          currency: "USD",
          promised_date: "2025-11-30",
          free_text_notes: "based on our payment cycle",
          sentiment: "Neutral",
          tone: "Professional"
        }
      };
      return extractionMap[emailId] || extractionMap["EMAIL-001"];
    };

    const getEnrichmentData = (emailId: string): EnrichmentData => {
      const enrichmentMap: { [key: string]: EnrichmentData } = {
        "EMAIL-001": {
          invoice_due_date: "2025-10-31",
          days_past_due: 45,
          previous_ptp_count: 3,
          previous_ptp_kept: 2,
          previous_ptp_broken: 1,
          open_dispute: false,
          customer_category: "Private Equity",
          risk_segment: "Medium",
          payment_history_score: 78,
          open_amount: 48500,
          ageing_bucket: "31-60 days",
          cltv: 1250000,
          customer_since: "2019-03-15",
          total_revenue_ytd: 485000,
          avg_days_to_pay: 32,
          credit_limit: 100000,
          credit_utilization: 48,
          last_payment_date: "2025-10-15",
          last_payment_amount: 52300
        },
        "EMAIL-002": {
          invoice_due_date: "2025-11-14",
          days_past_due: 12,
          previous_ptp_count: 5,
          previous_ptp_kept: 5,
          previous_ptp_broken: 0,
          open_dispute: false,
          customer_category: "Corporate",
          risk_segment: "Low",
          payment_history_score: 93,
          open_amount: 12300,
          ageing_bucket: "1-30 days",
          cltv: 680000,
          customer_since: "2020-06-22",
          total_revenue_ytd: 156000,
          avg_days_to_pay: 18,
          credit_limit: 50000,
          credit_utilization: 25,
          last_payment_date: "2025-11-10",
          last_payment_amount: 24500
        },
        "EMAIL-003": {
          invoice_due_date: "2025-08-27",
          days_past_due: 90,
          previous_ptp_count: 8,
          previous_ptp_kept: 3,
          previous_ptp_broken: 5,
          open_dispute: false,
          customer_category: "Private Equity",
          risk_segment: "High",
          payment_history_score: 32,
          open_amount: 76000,
          ageing_bucket: "91+ days",
          cltv: 920000,
          customer_since: "2018-01-10",
          total_revenue_ytd: 312000,
          avg_days_to_pay: 67,
          credit_limit: 150000,
          credit_utilization: 85,
          last_payment_date: "2025-08-05",
          last_payment_amount: 38000
        },
        "EMAIL-004": {
          invoice_due_date: "2025-09-12",
          days_past_due: 75,
          previous_ptp_count: 4,
          previous_ptp_kept: 1,
          previous_ptp_broken: 3,
          open_dispute: false,
          customer_category: "Financial Institution",
          risk_segment: "Critical",
          payment_history_score: 18,
          open_amount: 29950,
          ageing_bucket: "61-90 days",
          cltv: 245000,
          customer_since: "2021-09-03",
          total_revenue_ytd: 89000,
          avg_days_to_pay: 58,
          credit_limit: 40000,
          credit_utilization: 92,
          last_payment_date: "2025-07-20",
          last_payment_amount: 15000
        },
        "EMAIL-005": {
          invoice_due_date: "2025-11-01",
          days_past_due: 25,
          previous_ptp_count: 2,
          previous_ptp_kept: 2,
          previous_ptp_broken: 0,
          open_dispute: false,
          customer_category: "Asset Manager",
          risk_segment: "Medium",
          payment_history_score: 70,
          open_amount: 18200,
          ageing_bucket: "1-30 days",
          cltv: 125000,
          customer_since: "2022-04-18",
          total_revenue_ytd: 67500,
          avg_days_to_pay: 28,
          credit_limit: 25000,
          credit_utilization: 73,
          last_payment_date: "2025-10-28",
          last_payment_amount: 12800
        }
      };
      return enrichmentMap[emailId] || enrichmentMap["EMAIL-001"];
    };

    const handleEmailClick = async (email: IncomingEmail) => {
      setSelectedEmail(email);
      setCurrentStep('viewing');
      setExtractedData(null);
      setEnrichmentData(null);
      setScoringData(null);
      setConfidenceScore(0);
    };

    const handleProcessOnPage = async (email: IncomingEmail) => {
      setSelectedEmail(email);
      setIsProcessingOnPage(true);
      setShowProcessing(true);
      setProcessingMessage('AI is processing...');

      await new Promise(resolve => setTimeout(resolve, 4000));

      const extracted = getExtractionData(email.id);
      const enrichment = getEnrichmentData(email.id);
      const scoring = calculateScoring(extracted, enrichment);
      const confidence = calculateConfidence(extracted, enrichment);

      setExtractedData(extracted);
      setEnrichmentData(enrichment);
      setScoringData(scoring);
      setConfidenceScore(confidence);
      setShowProcessing(false);
      setIsProcessingOnPage(false);
      setCurrentStep('complete');

      const newRecord: PtpRecord = {
        id: `PTP-${Date.now()}`,
        customer: extracted.customer_name,
        invoice: extracted.invoice_numbers[0],
        amount: extracted.promised_amount,
        currency: extracted.currency,
        commitment_date: extracted.promised_date,
        commitment_text: extracted.free_text_notes,
        predicted_pay_date: scoring.predicted_payment_date,
        confidence_score: scoring.ptp_confidence_score,
        risk_level: scoring.risk_level,
        ptp_type: scoring.ptp_type,
        owner: "Collector – Priya N",
        last_interaction: "Email",
        sentiment: extracted.sentiment,
        recommended_action: scoring.recommendation,
        created_date: new Date().toISOString(),
        history_total: enrichment.previous_ptp_count,
        history_kept: enrichment.previous_ptp_kept,
        history_broken: enrichment.previous_ptp_broken,
        ageing: enrichment.ageing_bucket,
        status: 'Active'
      };
      setPtpRecords(prev => [newRecord, ...prev]);
    };

    const startProcessing = async () => {
      if (!selectedEmail) return;

      setCurrentStep('viewing');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentStep('extracting');
      setShowProcessing(true);
      setProcessingMessage('Processing email and analyzing payment commitment...');

      await new Promise(resolve => setTimeout(resolve, 4000));

      const extracted = getExtractionData(selectedEmail.id);
      const enrichment = getEnrichmentData(selectedEmail.id);
      const scoring = calculateScoring(extracted, enrichment);
      const confidence = calculateConfidence(extracted, enrichment);

      setExtractedData(extracted);
      setEnrichmentData(enrichment);
      setScoringData(scoring);
      setConfidenceScore(confidence);
      setShowProcessing(false);
      setCurrentStep('complete');

      const newRecord: PtpRecord = {
        id: `PTP-${Date.now()}`,
        customer: extracted.customer_name,
        invoice: extracted.invoice_numbers[0],
        amount: extracted.promised_amount,
        currency: extracted.currency,
        commitment_date: extracted.promised_date,
        commitment_text: extracted.free_text_notes,
        predicted_pay_date: scoring.predicted_payment_date,
        confidence_score: scoring.ptp_confidence_score,
        risk_level: scoring.risk_level,
        ptp_type: scoring.ptp_type,
        owner: "Collector – Priya N",
        last_interaction: "Email",
        sentiment: extracted.sentiment,
        recommended_action: scoring.recommendation,
        created_date: new Date().toISOString(),
        history_total: enrichment.previous_ptp_count,
        history_kept: enrichment.previous_ptp_kept,
        history_broken: enrichment.previous_ptp_broken,
        ageing: enrichment.ageing_bucket,
        status: 'Active'
      };
      setPtpRecords(prev => [newRecord, ...prev]);
    };

    const calculateConfidence = (extraction: ExtractionData, enrichment: EnrichmentData): number => {
      let score = 50;
      if (extraction.promised_date) score += 15;
      if (extraction.sentiment === 'Positive') score += 20;
      if (enrichment.previous_ptp_kept > enrichment.previous_ptp_broken) score += 15;
      if (enrichment.payment_history_score > 70) score += 10;
      if (extraction.sentiment === 'Non-committal' || extraction.sentiment === 'Vague') score -= 30;
      return Math.max(0, Math.min(100, score));
    };

    const calculateScoring = (extraction: ExtractionData, enrichment: EnrichmentData): PtpScoringData => {
      const scoreFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; points: number; detail: string }[] = [];

      const ptpKeptRate = enrichment.previous_ptp_count > 0
        ? (enrichment.previous_ptp_kept / enrichment.previous_ptp_count) * 100
        : 50;
      if (ptpKeptRate >= 80) {
        scoreFactors.push({ factor: 'PTP History', impact: 'positive', points: 25, detail: `${enrichment.previous_ptp_kept}/${enrichment.previous_ptp_count} promises kept (${Math.round(ptpKeptRate)}%)` });
      } else if (ptpKeptRate >= 50) {
        scoreFactors.push({ factor: 'PTP History', impact: 'neutral', points: 10, detail: `${enrichment.previous_ptp_kept}/${enrichment.previous_ptp_count} promises kept (${Math.round(ptpKeptRate)}%)` });
      } else {
        scoreFactors.push({ factor: 'PTP History', impact: 'negative', points: -15, detail: `${enrichment.previous_ptp_kept}/${enrichment.previous_ptp_count} promises kept (${Math.round(ptpKeptRate)}%)` });
      }

      if (enrichment.payment_history_score >= 80) {
        scoreFactors.push({ factor: 'Payment Behavior', impact: 'positive', points: 25, detail: `${enrichment.payment_history_score}% on-time payment rate` });
      } else if (enrichment.payment_history_score >= 60) {
        scoreFactors.push({ factor: 'Payment Behavior', impact: 'neutral', points: 10, detail: `${enrichment.payment_history_score}% on-time payment rate` });
      } else {
        scoreFactors.push({ factor: 'Payment Behavior', impact: 'negative', points: -10, detail: `${enrichment.payment_history_score}% on-time payment rate` });
      }

      if (extraction.promised_date) {
        scoreFactors.push({ factor: 'Commitment Clarity', impact: 'positive', points: 20, detail: `Specific date provided: ${extraction.promised_date}` });
      } else {
        scoreFactors.push({ factor: 'Commitment Clarity', impact: 'negative', points: -10, detail: 'No specific payment date committed' });
      }

      if (extraction.sentiment === 'Positive') {
        scoreFactors.push({ factor: 'Email Sentiment', impact: 'positive', points: 15, detail: `${extraction.tone} tone detected` });
      } else if (extraction.sentiment === 'Neutral') {
        scoreFactors.push({ factor: 'Email Sentiment', impact: 'neutral', points: 5, detail: `${extraction.tone} tone detected` });
      } else {
        scoreFactors.push({ factor: 'Email Sentiment', impact: 'negative', points: -5, detail: `${extraction.tone} tone detected` });
      }

      if (enrichment.cltv >= 500000) {
        scoreFactors.push({ factor: 'Customer Value', impact: 'positive', points: 15, detail: `High-value customer (CLTV: $${(enrichment.cltv / 1000).toFixed(0)}K)` });
      } else if (enrichment.cltv >= 100000) {
        scoreFactors.push({ factor: 'Customer Value', impact: 'neutral', points: 5, detail: `Mid-value customer (CLTV: $${(enrichment.cltv / 1000).toFixed(0)}K)` });
      } else {
        scoreFactors.push({ factor: 'Customer Value', impact: 'neutral', points: 0, detail: `Standard customer (CLTV: $${(enrichment.cltv / 1000).toFixed(0)}K)` });
      }

      const confidence = 98;

      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
      let recommendation = '';

      if (confidence >= 70) {
        riskLevel = 'Low';
        recommendation = 'Monitor only - high confidence in payment commitment\nSend automated reminder 2 days before promised date\nNo proactive outreach required';
      } else if (confidence >= 50) {
        riskLevel = 'Medium';
        recommendation = 'Send reminder email 3 days before promised date\nFollow up by phone if no response within 24 hours\nMonitor closely for commitment breach';
      } else {
        riskLevel = 'High';
        recommendation = 'Escalate to senior collector immediately\nSchedule call within 24 hours for commitment clarification\nConsider credit hold and legal review';
      }

      return {
        ptp_confidence_score: confidence,
        risk_level: riskLevel,
        predicted_payment_date: extraction.promised_date,
        ptp_type: extraction.promised_date ? 'Customer-declared' : 'Inferred',
        recommendation: recommendation,
        score_factors: scoreFactors
      };
    };

    const handleBack = () => {
      setSelectedEmail(null);
      setCurrentStep('viewing');
      setExtractedData(null);
      setEnrichmentData(null);
      setScoringData(null);
      setConfidenceScore(0);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const getRiskColor = (segment: string) => {
      switch (segment) {
        case 'Low':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Medium':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'High':
          return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'Critical':
          return 'bg-red-50 text-red-700 border-red-200';
        default:
          return 'bg-slate-50 text-slate-600 border-slate-200';
      }
    };

    if (selectedEmail) {
      return (
        <>
          <header className="bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#00263A]">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-slate-800 text-base font-semibold">Processing PTP Email</h1>
                  </div>
                  <p className="text-slate-500">
                    AI-powered extraction and risk assessment workflow
                  </p>
                </div>
              </div>
              {currentStep === 'viewing' && !showProcessing && (
                <button
                  onClick={startProcessing}
                  className="px-6 py-2.5 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2 font-semibold"
                >
                  <Brain className="w-4 h-4" />
                  <span>Process Email</span>
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {/* Processing Indicator - Full Screen Centered */}
            {showProcessing ? (
              <div className="fixed inset-0 flex items-center justify-center bg-slate-50/95 z-50">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 max-w-md w-full shadow-xl">
                  <div className="flex flex-col items-center gap-4">
                    <Loader className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="text-center">
                      <h3 className="text-blue-900 font-semibold text-sm">AI is processing...</h3>
                      <p className="text-blue-800">Analyzing payment commitment and extracting data</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Extracted + Enriched Data stacked */}
                <div className="space-y-6">
                  {/* Email Display - Show during viewing and extracting */}
                  {(currentStep === 'viewing' || currentStep === 'extracting') && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                        <h3 className="text-slate-800 text-sm font-semibold">Incoming Email</h3>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 p-4">
                          <div className="grid grid-cols-[80px_1fr] gap-3 text-sm mb-2">
                            <div className="text-slate-400">From:</div>
                            <div className="text-slate-800 font-medium">{selectedEmail.from}</div>
                          </div>
                          <div className="grid grid-cols-[80px_1fr] gap-3 text-sm mb-2">
                            <div className="text-slate-400">Subject:</div>
                            <div className="text-slate-800 font-medium">{selectedEmail.subject}</div>
                          </div>
                          <div className="grid grid-cols-[80px_1fr] gap-3 text-sm">
                            <div className="text-slate-400">Received:</div>
                            <div className="text-slate-500">{formatDate(selectedEmail.receivedDate)}</div>
                          </div>
                        </div>
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
                            {selectedEmail.body}
                          </pre>

                          {/* System linking badges - shown during viewing */}
                          {currentStep === 'viewing' && (() => {
                            const extracted = getExtractionData(selectedEmail.id);
                            const invoiceNum = extracted.invoice_numbers[0];
                            const customerName = extracted.customer_name;
                            const domain = selectedEmail.from.split('@')[1];

                            return (
                              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-emerald-700">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Invoice matched in SAP</span>
                                </div>
                                <div className="text-xs text-slate-400 ml-6">
                                  {invoiceNum} found in D365
                                </div>

                                <div className="flex items-center gap-2 text-sm text-emerald-700 mt-3">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Customer matched in D365</span>
                                </div>
                                <div className="text-xs text-slate-400 ml-6">
                                  Domain {domain} linked to {customerName}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Data */}
                  {extractedData && currentStep === 'complete' && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                        <h3 className="text-slate-800 text-sm font-semibold">Extracted From Email</h3>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Customer</div>
                            <div className="text-sm font-semibold text-slate-800">{extractedData.customer_name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Promised Amount</div>
                            <div className="text-base font-semibold text-blue-600">{formatCurrency(extractedData.promised_amount, extractedData.currency)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Invoice</div>
                            <div className="text-sm font-medium">{extractedData.invoice_numbers.join(', ')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Payment Date</div>
                            <div className="text-sm font-medium">{extractedData.promised_date || 'Not specified'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-3">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Sentiment</div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${extractedData.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                              extractedData.sentiment === 'Neutral' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                              }`}>{extractedData.sentiment}</span>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Tone</div>
                            <div className="text-sm italic text-slate-500">{extractedData.tone}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Email</div>
                            <div className="text-xs text-slate-800">{extractedData.email}</div>
                          </div>
                        </div>
                        {extractedData.free_text_notes && (
                          <div className="border-t border-slate-200 pt-3 mt-3">
                            <div className="text-xs text-slate-400 mb-0.5">Notes</div>
                            <div className="text-sm text-slate-800 bg-slate-50 p-2 rounded">"{extractedData.free_text_notes}"</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Enrichment */}
                  {enrichmentData && currentStep === 'complete' && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                        <h3 className="text-slate-800 text-sm font-semibold">Enriched Data (D365 + SAP Ariba)</h3>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          <div className="bg-blue-50 rounded p-2.5 text-center border border-blue-200">
                            <div className="text-xs text-blue-600">CLTV</div>
                            <div className="text-base font-semibold text-blue-900">${(enrichmentData.cltv / 1000).toFixed(0)}K</div>
                          </div>
                          <div className="bg-emerald-50 rounded p-2.5 text-center border border-emerald-200">
                            <div className="text-xs text-emerald-600">Revenue YTD</div>
                            <div className="text-base font-semibold text-emerald-900">${(enrichmentData.total_revenue_ytd / 1000).toFixed(0)}K</div>
                          </div>
                          <div className="bg-orange-50 rounded p-2.5 text-center border border-orange-200">
                            <div className="text-xs text-orange-600">Days Past Due</div>
                            <div className="text-base font-semibold text-orange-900">{enrichmentData.days_past_due}</div>
                          </div>
                          <div className="bg-purple-50 rounded p-2.5 text-center border border-purple-200">
                            <div className="text-xs text-purple-600">Pay Score</div>
                            <div className="text-base font-semibold text-purple-900">{enrichmentData.payment_history_score}%</div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-4 gap-4 border-t border-slate-200 pt-3">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Due Date</div>
                            <div className="text-sm font-medium">{enrichmentData.invoice_due_date}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Ageing Bucket</div>
                            <div className="text-sm font-medium">{enrichmentData.ageing_bucket}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Category</div>
                            <div className="text-sm font-medium">{enrichmentData.customer_category}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Risk Segment</div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${enrichmentData.risk_segment === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                              enrichmentData.risk_segment === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                enrichmentData.risk_segment === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                              }`}>{enrichmentData.risk_segment}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Avg Days to Pay</div>
                            <div className="text-sm font-medium">{enrichmentData.avg_days_to_pay} days</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Credit Utilization</div>
                            <div className="text-sm font-medium">{enrichmentData.credit_utilization}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Customer Since</div>
                            <div className="text-sm font-medium">{enrichmentData.customer_since}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Last Payment</div>
                            <div className="text-sm font-semibold text-emerald-600">${enrichmentData.last_payment_amount.toLocaleString()}</div>
                          </div>
                        </div>

                        {/* PTP History */}
                        <div className="flex items-center gap-4 border-t border-slate-200 pt-3 mt-3">
                          <span className="text-xs text-slate-400">PTP History:</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm"><span className="font-bold">{enrichmentData.previous_ptp_count}</span> Total</span>
                            <span className="text-sm text-emerald-600"><span className="font-bold">{enrichmentData.previous_ptp_kept}</span> Kept</span>
                            <span className="text-sm text-red-600"><span className="font-bold">{enrichmentData.previous_ptp_broken}</span> Broken</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Enrichment and Analysis */}
                <div className="space-y-6">
                  {/* PTP Scoring & Prediction - MOVED TO TOP */}
                  {scoringData && currentStep === 'complete' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                        <h3 className="text-slate-800 text-sm font-semibold">PTP Scoring & Prediction</h3>
                      </div>

                      <div className="bg-slate-50 border border-[#7AADCB]/40 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#00263A]">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-blue-900 font-semibold mb-4">AI Predictions</h4>

                            <div className="space-y-4">
                              {/* Confidence Score */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-semibold text-blue-900">PTP Confidence Score</div>
                                  <span className="text-sm font-semibold text-blue-900">{scoringData.ptp_confidence_score}%</span>
                                </div>
                                <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#00263A] transition-all duration-1000"
                                    style={{ width: `${scoringData.ptp_confidence_score}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Score Reasoning - Compact Pills */}
                              <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                                <div className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                  <Brain className="w-3.5 h-3.5" />
                                  Score Factors
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {scoringData.score_factors.map((factor, index) => (
                                    <div
                                      key={index}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${factor.impact === 'positive'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : factor.impact === 'negative'
                                          ? 'bg-red-50 border-red-200 text-red-700'
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                      title={factor.detail}
                                    >
                                      <span>{factor.factor}</span>
                                      <span className="font-bold">
                                        {factor.points >= 0 ? '+' : ''}{factor.points}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Grid Info */}
                              <div className="grid grid-cols-2 gap-3 pt-3">
                                <div className="bg-white/60 rounded-lg p-3">
                                  <div className="text-xs text-blue-700 mb-1">Risk Level</div>
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(scoringData.risk_level)}`}>
                                    {scoringData.risk_level}
                                  </span>
                                  <div className="text-[10px] text-slate-500 mt-1.5">
                                    {scoringData.risk_level === 'Low' && '→ Tier 2 (Controlled auto)'}
                                    {scoringData.risk_level === 'Medium' && '→ Tier 1 (Draft)'}
                                    {scoringData.risk_level === 'High' && '→ Tier 0 (Assist)'}
                                    {scoringData.risk_level === 'Critical' && '→ Tier 0 (Assist)'}
                                  </div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3">
                                  <div className="text-xs text-blue-700 mb-1">PTP Type</div>
                                  <div className="text-sm font-semibold text-blue-900">{scoringData.ptp_type}</div>
                                </div>
                              </div>

                              {/* Model card: problem, approach, metrics */}
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Model card (Email intent / PTP)</div>
                                <div className="text-[11px] text-slate-600 space-y-1">
                                  <p><span className="font-semibold">Problem:</span> Email/commitment classification, payment-date prediction.</p>
                                  <p><span className="font-semibold">Approach:</span> Supervised classifier + LLM assist.</p>
                                  <p><span className="font-semibold">Primary metrics:</span> F1 by class; escalation accuracy.</p>
                                </div>
                              </div>

                              <div className="bg-white/60 rounded-lg p-3">
                                <div className="text-xs text-blue-700 mb-1">Predicted Payment Date</div>
                                <div className="text-sm font-semibold text-blue-900">
                                  {scoringData.predicted_payment_date || 'Not predicted'}
                                </div>
                              </div>

                              {/* Recommendation */}
                              <div className="pt-3 border-t border-blue-200">
                                <div className="flex items-start gap-2">
                                  <Target className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-xs font-semibold text-blue-900 mb-2">AI Recommendation</div>
                                    <div className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                                      {scoringData.recommendation}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-blue-200 bg-emerald-50/50 rounded-lg p-3 -mx-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                                  <span className="text-sm font-semibold text-emerald-900">PTP record created</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      );
    }

    // Email List View
    return (
      <>
        <header className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#00263A]">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-slate-800 text-base font-semibold">Promise to Pay (PTP)</h1>
              </div>
              <p className="text-slate-500">
                AI-powered payment commitment extraction and risk assessment
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {/* PTP capability card */}
          <div className="mb-5 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00263A] flex items-center justify-center shadow-md">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-semibold text-base mb-2">AI-Powered PTP Detection &amp; Prediction</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    Incoming customer emails are processed automatically: payment commitments are extracted, data is enriched from D365 and SAP Ariba, and machine learning predicts payment likelihood and recommends optimal collection actions.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Mail, label: 'Email Extraction', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { icon: LinkIcon, label: 'System Linking', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                      { icon: Database, label: 'Data Enrichment', color: 'bg-violet-50 text-violet-700 border-violet-100' },
                      { icon: Target, label: 'Risk Scoring', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${item.color}`}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-white border border-slate-200 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-6 py-2.5 rounded-lg transition-all ${activeTab === 'incoming'
                ? 'bg-[#00263A] text-white font-medium'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Incoming Emails</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'incoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {mockEmails.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-2.5 rounded-lg transition-all ${activeTab === 'records'
                ? 'bg-[#00263A] text-white font-medium'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>PTP Records</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'records'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  {ptpRecords.length}
                </span>
              </div>
            </button>
          </div>

          {/* Incoming Emails Tab */}
          {activeTab === 'incoming' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                <h3 className="text-slate-800 text-sm font-semibold">Incoming PTP Emails</h3>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {mockEmails.length} Unprocessed
                </span>
              </div>

              <div className="space-y-3">
                {mockEmails.map((email) => (
                  <div
                    key={email.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg transition-all hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="flex-1"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <h4 className="text-slate-800 font-semibold">{email.subject}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs">From:</span>
                            <span className="font-medium">{email.from}</span>
                          </span>
                          <span>•</span>
                          <span className="text-xs">{formatDate(email.receivedDate)}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {email.body}
                        </p>
                        {email.id === 'EMAIL-001' && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Invoice matched in SAP</div>
                                <div className="text-xs text-slate-500">INV-10023 found in D365</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Customer matched in D365</div>
                                <div className="text-xs text-slate-500">Domain pinnaclecp.com linked to Pinnacle Capital Partners LLC</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {email.id === 'EMAIL-002' && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Invoice matched in SAP</div>
                                <div className="text-xs text-slate-500">KRL-INV-4799 found in D365</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Customer matched in D365</div>
                                <div className="text-xs text-slate-500">Domain aldridgecapital.com linked to Aldridge Capital Group</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {email.id === 'EMAIL-003' && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Invoice matched in SAP</div>
                                <div className="text-xs text-slate-500">KRL-INV-4756 found in D365</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Customer matched in D365</div>
                                <div className="text-xs text-slate-500">Domain meridianpe.com linked to Meridian Private Equity</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {email.id === 'EMAIL-004' && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Invoice matched in SAP</div>
                                <div className="text-xs text-slate-500">KRL-INV-4712 found in D365</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Customer matched in D365</div>
                                <div className="text-xs text-slate-500">Domain horizonrestructuring.co.uk linked to Horizon Restructuring Ltd</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {email.id === 'EMAIL-005' && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Invoice matched in SAP</div>
                                <div className="text-xs text-slate-500">KRL-INV-4688 found in D365</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-slate-800">Customer matched in D365</div>
                                <div className="text-xs text-slate-500">Domain sterlingmgt.com linked to Sterling Asset Management</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProcessOnPage(email);
                          }}
                          className="px-4 py-2 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Process Email</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PTP Records Tab */}
          {activeTab === 'records' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#00263A] rounded"></div>
                <h3 className="text-slate-800 text-sm font-semibold">PTP Predictor Dashboard</h3>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  {ptpRecords.length} Records
                </span>
              </div>

              {ptpRecords.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-slate-800 font-semibold mb-2">No PTP Records Yet</h4>
                  <p className="text-slate-500 text-sm">
                    Process incoming emails to create PTP records with AI-powered predictions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ptpRecords.map((record) => (
                    <div key={record.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Header Row */}
                      <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Customer</div>
                            <div className="font-semibold text-slate-800">{record.customer}</div>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Invoice</div>
                            <div className="text-sm font-medium text-slate-800">{record.invoice}</div>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">Amount</div>
                            <div className="font-semibold text-blue-600">{formatCurrency(record.amount, record.currency)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${record.risk_level === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            record.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                              record.risk_level === 'High' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                                'bg-red-50 text-red-700 border-red-300'
                            }`}>
                            {record.risk_level} Risk
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.ptp_type === 'Customer-declared' ? 'bg-blue-100 text-blue-700' :
                            record.ptp_type === 'Inferred' ? 'bg-purple-100 text-purple-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                            {record.ptp_type}
                          </span>
                        </div>
                      </div>

                      {/* Content Row */}
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-5 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Commitment Date
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                              {record.commitment_date ? new Date(record.commitment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
                            </div>
                            {record.commitment_text && (
                              <div className="text-xs text-slate-500 italic mt-1">"{record.commitment_text}"</div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Predicted Payment
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                              {record.predicted_pay_date ? new Date(record.predicted_pay_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Uncertain'}
                            </div>
                            {record.ageing && (
                              <div className="text-xs text-orange-600 mt-1">Ageing: {record.ageing}</div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              Confidence Score
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#00263A]">{record.confidence_score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2">
                              <div
                                className="h-full bg-[#00263A] rounded-full"
                                style={{ width: `${record.confidence_score}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              PTP History
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-800 font-medium">Total: {record.history_total}</span>
                              <span className="text-emerald-600 font-semibold">✓ {record.history_kept}</span>
                              <span className="text-red-600 font-semibold">✗ {record.history_broken}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {record.history_total > 0 ? `${Math.round((record.history_kept / record.history_total) * 100)}% kept` : 'No history'}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Owner
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                              {record.owner.replace('Collector – ', '')}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Mail className="w-3 h-3" />
                              {record.last_interaction}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation & Actions */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            <Target className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-slate-400 mb-0.5">AI Recommendation</div>
                              <div className="text-sm text-slate-800">{record.recommended_action}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-6">
                            <button
                              className="px-4 py-2 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2 text-sm"
                              onClick={() => setSelectedAction({ recordId: record.id, action: 'reminder' })}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Send Reminder
                            </button>
                            <button
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                              onClick={() => setSelectedAction({ recordId: record.id, action: 'call' })}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Schedule Call
                            </button>
                            <button
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                              onClick={() => setSelectedAction({ recordId: record.id, action: 'more' })}
                            >
                              More Actions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Modal */}
          {selectedAction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-2xl">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {selectedAction.action === 'reminder' && 'Send Payment Reminder'}
                    {selectedAction.action === 'call' && 'Schedule Follow-up Call'}
                    {selectedAction.action === 'more' && 'More Actions'}
                  </h3>
                  <button
                    onClick={() => setSelectedAction(null)}
                    className="p-1 hover:bg-slate-50 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  {selectedAction.action === 'reminder' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">AI-Generated Reminder Email</h4>
                            <p className="text-sm text-blue-800">
                              The system has automatically drafted a personalized reminder email based on customer history and commitment details.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Preview</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
                          <p className="mb-3">Dear Customer,</p>
                          <p className="mb-3">
                            This is a friendly reminder regarding your payment commitment for invoice {ptpRecords.find(r => r.id === selectedAction.recordId)?.invoice}.
                          </p>
                          <p className="mb-3">
                            Amount: {ptpRecords.find(r => r.id === selectedAction.recordId) && formatCurrency(
                              ptpRecords.find(r => r.id === selectedAction.recordId)!.amount,
                              ptpRecords.find(r => r.id === selectedAction.recordId)!.currency
                            )}
                          </p>
                          <p className="mb-3">
                            Commitment Date: {ptpRecords.find(r => r.id === selectedAction.recordId)?.commitment_date &&
                              new Date(ptpRecords.find(r => r.id === selectedAction.recordId)!.commitment_date!).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p>Please let us know if you have any questions or need assistance.</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedAction(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            toast.success('Reminder email sent successfully!');
                            setSelectedAction(null);
                          }}
                          className="px-4 py-2 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedAction.action === 'call' && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-purple-900 mb-2">Schedule Call Task</h4>
                            <p className="text-sm text-purple-800">
                              This will create a task in your D365 calendar and send notifications.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Call Date & Time</label>
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">Notes</label>
                        <textarea
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          rows={3}
                          placeholder="Add any notes for the call..."
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedAction(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            toast.success('Call scheduled and added to your calendar!');
                            setSelectedAction(null);
                          }}
                          className="px-4 py-2 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Call
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedAction.action === 'more' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          toast.info('Escalating to Senior Collector...');
                          setSelectedAction(null);
                        }}
                        className="w-full px-4 py-3 border border-slate-200 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <Flag className="w-4 h-4 text-orange-600" />
                        <div>
                          <div className="font-medium text-slate-800">Escalate to Senior Collector</div>
                          <div className="text-xs text-slate-500">Route to Treasury Ops or senior team member</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Converting to dispute case...');
                          setSelectedAction(null);
                        }}
                        className="w-full px-4 py-3 border border-slate-200 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <div>
                          <div className="font-medium text-slate-800">Convert to Dispute</div>
                          <div className="text-xs text-slate-500">Create dispute case if customer raises issues</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Marking PTP as paid...');
                          setSelectedAction(null);
                        }}
                        className="w-full px-4 py-3 border border-slate-200 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-medium text-slate-800">Mark as Paid</div>
                          <div className="text-xs text-slate-500">Close PTP when payment received in SAP</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Requesting more information...');
                          setSelectedAction(null);
                        }}
                        className="w-full px-4 py-3 border border-slate-200 text-left rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-slate-800">Request More Information</div>
                          <div className="text-xs text-slate-500">Send email requesting clarification</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </>
    );
  };

  const QADashboardView = ({ onViewAllReviews }: { onViewAllReviews: () => void }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
    const [selectedAgent, setSelectedAgent] = useState('All Agents');
    const [selectedType, setSelectedType] = useState('All Types');
    const [complianceOnly, setComplianceOnly] = useState(false);

    // Mock data for charts
    const qualityData = [
      { name: 'Critical (<60)', value: 50, color: '#ef4444' },
      { name: 'Needs Work (60-79)', value: 20, color: '#f97316' },
      { name: 'Good (80+)', value: 191, color: '#10b981' },
    ];

    const trendData = [
      { week: 'Week 1', score: 72 },
      { week: 'Week 2', score: 74 },
      { week: 'Week 3', score: 76 },
      { week: 'Week 4', score: 78 },
    ];

    const sentimentData = [
      { name: 'Positive', value: 189, color: '#10b981' },
      { name: 'Neutral', value: 63, color: '#6b7280' },
      { name: 'Negative', value: 9, color: '#ef4444' },
    ];

    const categoryData = [
      { name: 'Pricing', value: 89 },
      { name: 'Delivery', value: 65 },
      { name: 'Tax', value: 45 },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800 mb-2">QA Dashboard</h1>
            <p className="text-slate-500 text-sm">Monitor call quality and agent performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Observability */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <Monitor className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1">Observability</h4>
            <p className="text-xs text-slate-600">Application Insights / OpenTelemetry traces each agent call, decision, and human override. Used for continuous control testing and false auto-post rate tracking.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="relative">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option>All Agents</option>
                  <option>Agent 1</option>
                  <option>Agent 2</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option>All Types</option>
                <option>Type 1</option>
                <option>Type 2</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={complianceOnly}
                onChange={(e) => setComplianceOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
              />
              <span className="text-sm text-slate-700">Compliance Issues Only</span>
            </label>
          </div>
          <div className="text-sm text-slate-600">
            Showing: All Data <span className="font-semibold text-slate-800">(261 calls)</span>
          </div>
        </div>

        {/* Key Metric Cards */}
        <div className="grid grid-cols-5 gap-4">
          {/* Calls Analyzed */}
          <div className="bg-[#00263A] rounded-lg p-6 text-white shadow-sm">
            <div className="text-sm font-medium text-blue-100 mb-2">Calls Analyzed</div>
            <div className="text-4xl font-bold mb-2">261</div>
            <div className="flex items-center gap-1 text-sm text-blue-100">
              <TrendingUp className="w-4 h-4" />
              <span>7% from last week</span>
            </div>
          </div>

          {/* Avg QA Score */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Avg QA Score</div>
            <div className="text-base font-semibold text-slate-800 mb-3">81 <span className="text-lg text-green-600">Good</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '81%' }}></div>
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Compliance</div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="text-base font-semibold text-slate-800">54</div>
            </div>
            <div className="text-sm text-slate-600">breaches</div>
            <div className="text-xs text-slate-500 mt-1">21% of filtered calls</div>
          </div>

          {/* Neg. Sentiment */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Neg. Sentiment</div>
            <div className="text-base font-semibold text-slate-800 mb-1">3%</div>
            <div className="text-sm text-slate-600">1 negative calls</div>
            <TrendingDown className="w-4 h-4 text-slate-400 mt-2" />
          </div>

          {/* Escalations */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Escalations</div>
            <div className="text-base font-semibold text-slate-800 mb-1">54</div>
            <div className="text-sm text-slate-600">calls</div>
            <div className="text-xs text-rose-600 mt-1">Score below 60</div>
          </div>
        </div>

        {/* Model performance (primary metrics by problem) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Model performance (primary metrics)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-100 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment matching (cash apps)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Precision@1</span><span className="font-semibold text-slate-800">0.94</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Recall@k</span><span className="font-semibold text-slate-800">0.89</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Calibration error</span><span className="font-semibold text-slate-800">0.02</span></div>
                <div className="flex justify-between"><span className="text-slate-600">False auto-post rate</span><span className="font-semibold text-slate-800">0.4%</span></div>
              </div>
            </div>
            <div className="border border-slate-100 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Remittance extraction</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Field F1</span><span className="font-semibold text-slate-800">0.91</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Critical-field-missing rate</span><span className="font-semibold text-slate-800">2.1%</span></div>
              </div>
            </div>
            <div className="border border-slate-100 rounded-lg p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email intent classification</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">F1 by class</span><span className="font-semibold text-slate-800">0.87</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Escalation accuracy</span><span className="font-semibold text-slate-800">0.93</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Call Quality Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-1">Call Quality Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">How 261 calls scored on quality assessment.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={qualityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">76%</span> of calls meet quality standards (score 80+).
            </div>
          </div>

          {/* Average Score Trend */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-1">Average Score Trend</h3>
            <p className="text-xs text-slate-500 mb-6">QA score progression over the past 4 weeks.</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-slate-600">
              Improved by <span className="font-semibold text-slate-800">4 points</span> over 4 weeks.
            </div>
          </div>

          {/* Customer Sentiment */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-1">Customer Sentiment</h3>
            <p className="text-xs text-slate-500 mb-6">How customers felt during their calls.</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-700">Positive</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">189</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-sm text-slate-700">Neutral</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">63</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-700">Negative</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">9</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Great! <span className="font-semibold text-green-600">72%</span> of customers had a positive experience.
            </div>
          </div>

          {/* Call Categories */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-1">Call Categories</h3>
            <p className="text-xs text-slate-500 mb-6">What issues are customers calling about.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Pricing</span> is the most common call type <span className="font-semibold text-slate-800">(34%</span> of calls).
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CallReviewsView = ({ onSelectCall }: { onSelectCall: (call: any) => void }) => {
    const mockCalls = [
      { id: 'CALL-001', agentName: 'John Smith', customerName: 'Pinnacle Capital Partners', dateTime: '2025-01-15 10:30 AM', duration: '5:23', qaScore: 85, sentiment: 'Positive', category: 'Pricing', disputeId: 'DSP-2025-001', compliance: 'Pass' },
      { id: 'CALL-002', agentName: 'Jane Doe', customerName: 'Aldridge Capital Group', dateTime: '2025-01-15 11:15 AM', duration: '8:45', qaScore: 72, sentiment: 'Neutral', category: 'Billing', disputeId: 'DSP-2025-002', compliance: 'Fail', flags: ['Missing verification'] },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Call Reviews</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Call ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockCalls.map((call) => (
                <tr key={call.id} onClick={() => onSelectCall(call)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{call.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{call.agentName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{call.customerName}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{call.qaScore}/100</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${call.compliance === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {call.compliance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AutoAuditView = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">Auto-Audit</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-slate-600">Auto-audit functionality coming soon...</p>
      </div>
    </div>
  );

  const PatternsInsightsView = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">Patterns & Insights</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-slate-600">Patterns and insights functionality coming soon...</p>
      </div>
    </div>
  );

  const AgentCoachingView = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">Agent Coaching</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-slate-600">Agent coaching functionality coming soon...</p>
      </div>
    </div>
  );

  const QAConfigurationView = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">QA Configuration</h2>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-slate-600">QA configuration functionality coming soon...</p>
      </div>
    </div>
  );

  const QAView = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'audit' | 'patterns' | 'coaching' | 'config'>('dashboard');
    const [selectedCallReview, setSelectedCallReview] = useState<any>(null);

    const navItems = [
      { id: 'dashboard', label: 'QA Dashboard', icon: LayoutDashboard },
      { id: 'reviews', label: 'Call Reviews', icon: Phone },
      { id: 'audit', label: 'Auto-Audit', icon: Zap },
      { id: 'patterns', label: 'Patterns & Insights', icon: TrendingUp },
      { id: 'coaching', label: 'Agent Coaching', icon: User },
      { id: 'config', label: 'QA Configuration', icon: Settings },
    ];

    // CallDetail component (for Call Reviews)
    const CallDetailView = ({ call, onBack }: { call: any; onBack: () => void }) => {
      const [isPlaying, setIsPlaying] = useState(false);
      const [showTranscript, setShowTranscript] = useState(false);
      const [reviewerNotes, setReviewerNotes] = useState("Solid call handling. Verified the issue quickly and provided a clear timeline for resolution.");
      const [adjustedScore, setAdjustedScore] = useState(call.qaScore);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [showConfirmDialog, setShowConfirmDialog] = useState(false);
      const [isCompleted, setIsCompleted] = useState(false);

      const handleCompleteReview = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsCompleted(true);
        setShowConfirmDialog(false);
        setTimeout(() => onBack(), 2000);
      };

      const agentFirstName = call.agentName.split(' ')[0];
      const transcript = [
        { time: '00:05', speaker: 'Agent', text: `Thank you for calling. My name is ${agentFirstName}. How can I help you today?`, sentiment: 'neutral' },
        { time: '00:12', speaker: 'Customer', text: `Hi, I'm calling about ${call.category.toLowerCase()} issue. There seems to be a problem with ${call.disputeId}.`, sentiment: call.sentiment === 'Negative' ? 'negative' : call.sentiment === 'Positive' ? 'positive' : 'neutral' },
        { time: '00:20', speaker: 'Agent', text: "I apologize for the inconvenience. I can certainly help you look into that. Can you please confirm your account details?", sentiment: 'positive' },
        { time: '00:28', speaker: 'Customer', text: `It's related to ${call.customerName}. This has been an ongoing issue.`, sentiment: call.sentiment === 'Negative' ? 'negative' : 'neutral' },
        { time: '00:35', speaker: 'Agent', text: `I understand, and I'm sorry for the issue. Let me pull up your account for ${call.customerName}... Okay, I see the details here.`, sentiment: 'empathetic' },
        { time: '00:45', speaker: 'Agent', text: "I'm reviewing the information now. I can see what the problem is.", sentiment: 'neutral' },
        { time: '00:55', speaker: 'Customer', text: "Yes, exactly. Can you help resolve this?", sentiment: 'neutral' },
        { time: '01:05', speaker: 'Agent', text: `You are absolutely right. I will create a dispute case immediately to correct this. The case number is ${call.disputeId}.`, sentiment: 'positive' },
        { time: '01:15', speaker: 'Customer', text: "Okay, thank you. How long will it take to fix?", sentiment: 'neutral' },
        { time: '01:20', speaker: 'Agent', text: "I've flagged it as high priority. You should see the resolution within 24 hours. Is there anything else?", sentiment: 'positive' },
        { time: '01:30', speaker: 'Customer', text: call.sentiment === 'Positive' ? "No, that's it. Thanks for the quick help." : call.sentiment === 'Negative' ? "I hope so. This has been frustrating." : "Okay, thank you.", sentiment: call.sentiment === 'Positive' ? 'positive' : call.sentiment === 'Negative' ? 'negative' : 'neutral' },
        { time: '01:35', speaker: 'Agent', text: "You're welcome. Thank you for choosing us. Have a great day!", sentiment: 'positive' },
      ];

      if (isCompleted) {
        return (
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Review Completed Successfully!</p>
                  <p className="text-sm text-green-700">Redirecting back to call reviews...</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-white -m-8">
          <div className="bg-white border-b border-blue-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-800">Call Review: {call.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${call.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    call.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {call.sentiment} Sentiment
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {call.dateTime} • Agent: {call.agentName} • Customer: {call.customerName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">QA Score</div>
                <div className={`text-lg font-semibold ${adjustedScore >= 85 ? 'text-green-600' : adjustedScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {adjustedScore}/100
                </div>
              </div>
              <button onClick={() => setShowConfirmDialog(true)} className="px-5 py-2.5 bg-[#00263A] text-white rounded-lg text-sm font-semibold hover:bg-[#003354] transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submit Review
              </button>
            </div>
          </div>

          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Complete Review?</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to submit this review? The final score is <span className="font-bold text-blue-600">{adjustedScore}/100</span>.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmDialog(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleCompleteReview} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#00263A] text-white rounded-lg font-semibold hover:bg-[#003354] disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="w-4 h-4" /> Confirm</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            <div className="col-span-3 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-[#00263A] text-white flex items-center justify-center hover:bg-[#003354]">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 pl-0.5" />}
                  </button>
                  <div className="flex-1 h-14 bg-transparent rounded-lg border-2 border-blue-200 flex items-center px-3 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className={`w-1.5 rounded-full ${isPlaying && i < 15 ? 'bg-[#00263A]' : 'bg-slate-300'}`} style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-3">
                  <span className="bg-white px-2 py-1 rounded">01:15</span>
                  <span className="bg-white px-2 py-1 rounded">{call.duration}</span>
                </div>
                <button onClick={() => setShowTranscript(!showTranscript)} className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {showTranscript ? 'Hide Transcript' : 'View Transcript'}
                  {showTranscript ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              {showTranscript && (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 border-t border-blue-200 bg-blue-50">
                  {transcript.map((entry, idx) => (
                    <div key={idx} className={`flex gap-3 ${entry.speaker === 'Agent' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.speaker === 'Agent' ? 'bg-[#00263A] text-white' : 'bg-slate-400 text-white'}`}>
                        {entry.speaker === 'Agent' ? <Mic className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={`flex flex-col max-w-[85%] ${entry.speaker === 'Agent' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3.5 rounded-lg text-sm ${entry.speaker === 'Agent' ? 'bg-blue-50 text-blue-900 rounded-tr-none border border-blue-200' : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                          }`}>
                          {entry.text}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1.5 font-medium">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-5 bg-gradient-to-br from-blue-50 to-white border-r border-blue-200 overflow-y-auto p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                  <h3 className="font-semibold text-base text-slate-800 flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-600" />
                    Call Summary
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Call ID</div>
                        <div className="font-semibold text-gray-900">{call.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Dispute ID</div>
                        <div className="font-semibold text-gray-900">{call.disputeId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Category</div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{call.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Customer</div>
                        <div className="font-semibold text-gray-900">{call.customerName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="font-semibold text-gray-900">{call.duration}</div>
                      </div>
                    </div>
                    {call.flags && call.flags.length > 0 && (
                      <div className="flex items-start gap-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <div>
                          <div className="text-xs text-red-600 font-semibold mb-1">Flags</div>
                          <div className="flex flex-wrap gap-1.5">
                            {call.flags.map((flag: string, idx: number) => (
                              <span key={idx} className="inline-block px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-100">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Compliance</div>
                        <div className="flex items-center gap-2">
                          {call.compliance === 'Pass' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              Fail
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                  <h3 className="font-semibold text-base text-slate-800 flex items-center gap-2 mb-4">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                    Sentiment & Empathy
                  </h3>
                  <div className="space-y-2.5">
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Customer Sentiment</span>
                        <span className={`font-semibold ${call.sentiment === 'Positive' ? 'text-green-600' :
                          call.sentiment === 'Negative' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                          {call.sentiment}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Agent Empathy Score</span>
                        <span className="text-blue-600 font-semibold">9.2/10</span>
                      </div>
                      <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                        <div className="w-[92%] bg-[#00263A] h-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-4 bg-white flex flex-col overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-lg border border-blue-200 p-4">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Coaching Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 text-xs mb-1">Key Strength</h4>
                      <p className="text-xs text-blue-800">Excellent empathy demonstration when customer expressed frustration.</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 text-xs mb-1">Coaching Opportunity</h4>
                      <p className="text-xs text-blue-800">Consider proactively offering solutions to prevent future issues.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-blue-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Reviewer Notes
                    </h3>
                    <textarea value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} className="w-full min-h-[120px] p-3 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Add your notes here..."></textarea>
                  </div>
                  <div className="bg-white rounded-lg border border-blue-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Final Score
                    </h3>
                    <div className="space-y-3">
                      <input type="range" className="w-full h-2 bg-blue-100 rounded-lg accent-blue-600" min="0" max="100" value={adjustedScore} onChange={(e) => setAdjustedScore(Number(e.target.value))} />
                      <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-center">
                        <span className="font-bold text-lg text-blue-600">{adjustedScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white mt-auto sticky bottom-0">
                <button onClick={() => setShowConfirmDialog(true)} disabled={isCompleted} className="w-full py-4 bg-[#00263A] text-white rounded-lg font-bold text-base hover:bg-[#003354] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCompleted ? <><CheckCircle2 className="w-5 h-5" /> Review Completed</> : <><FileText className="w-5 h-5" /> Complete Review</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // If a call is selected for detail view, show that instead
    if (selectedCallReview) {
      return <CallDetailView call={selectedCallReview} onBack={() => setSelectedCallReview(null)} />;
    }

    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-semibold text-slate-800">Quality Assurance</h1>
              <p className="text-slate-500 text-sm">Monitor, analyze, and improve agent performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search calls, agents..."
                  className="pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button className="px-4 py-2 bg-[#00263A] text-white rounded-lg text-sm font-medium hover:bg-[#003354] transition-colors">
                New Audit
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && <QADashboardView onViewAllReviews={() => setActiveTab('reviews')} />}
          {activeTab === 'reviews' && <CallReviewsView onSelectCall={(call) => setSelectedCallReview(call)} />}
          {activeTab === 'audit' && <AutoAuditView />}
          {activeTab === 'patterns' && <PatternsInsightsView />}
          {activeTab === 'coaching' && <AgentCoachingView />}
          {activeTab === 'config' && <QAConfigurationView />}
        </div>
      </div>
    );
  };

  const HelpView = () => {
    const [helpMode, setHelpMode] = useState<'assist' | 'architecture'>('assist');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [currentPhase, setCurrentPhase] = useState<'search' | 'loading-recent' | 'recent-invoices' | 'invoice-detail' | 'resolving' | 'resolved'>('search');
    const [dontKnowInvoice, setDontKnowInvoice] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'invoice' | 'contract' | 'po' | 'attachments' | 'history'>('invoice');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const flowRef = useRef({
      invnumber: false,
      creditmemo: false,
      updatedinvoice: false
    });

    const [loadingSteps, setLoadingSteps] = useState<Array<{ id: string; label: string; status: 'pending' | 'loading' | 'complete' }>>([
      { id: 'connect', label: 'Connected to billing database', status: 'pending' },
      { id: 'loading', label: 'Loading documents', status: 'pending' },
      { id: 'metadata', label: 'Extracting metadata (amount, discount status)', status: 'pending' },
      { id: 'eligibility', label: 'Checking discount eligibility per cycle', status: 'pending' },
    ]);

    const recentInvoices = [
      { number: '54410', amount: '$94,200', status: 'Closed' as const, discountStatus: 'Discount Applied' as const, state: 'success' as const },
      { number: '54562', amount: '$112,450', status: 'Closed' as const, discountStatus: 'Discount Applied' as const, state: 'success' as const },
      { number: '54789', amount: '$87,300', status: 'Closed' as const, discountStatus: 'Discount Applied' as const, state: 'success' as const },
      { number: '54829', amount: '$128,600', status: 'Flagged' as const, discountStatus: 'Discount Missing' as const, state: 'warning' as const },
      { number: '54878', amount: '$103,500', status: 'Open' as const, discountStatus: 'Discount Applied' as const, state: 'pending' as const },
    ];

    const [executionSteps, setExecutionSteps] = useState<Array<{ id: string; label: string; status: 'pending' | 'loading' | 'complete' }>>([
      { id: 'credit', label: 'Applying credit memo', status: 'pending' },
      { id: 'recalc', label: 'Recalculating invoice', status: 'pending' },
      { id: 'po', label: 'Updating PO reference', status: 'pending' },
      { id: 'generate', label: 'Generating revised invoice', status: 'pending' },
      { id: 'send', label: 'Sending invoice to billing contacts', status: 'pending' },
    ]);

    const [activities, setActivities] = useState([
      { id: '1', action: 'Discrepancy detected', time: '2 minutes ago', status: 'complete' as const },
      { id: '2', action: 'Investigation completed', time: '1 minute ago', status: 'complete' as const },
      { id: '3', action: 'Credit memo applied', time: 'Just now', status: 'pending' as const },
      { id: '4', action: 'Invoice updated and sent', time: 'Pending', status: 'pending' as const },
    ]);

    const [actionStates, setActionStates] = useState({
      creditMemo: 'idle' as 'idle' | 'loading' | 'done',
      updatedInvoice: 'idle' as 'idle' | 'loading' | 'done',
      updatePO: 'idle' as 'idle' | 'loading' | 'done',
      monitoring: 'idle' as 'idle' | 'loading' | 'done',
    });

    // System prompt for ElevenLabs ConvAI
    const systemPromptOverride = `You are Sarah, a helpful and empathetic Kroll Receivables Intelligence support representative. Your role is to assist clients with invoice disputes, particularly fee discrepancies and missing engagement-level contract discounts on Kroll advisory invoices.
When the call begins, greet the client warmly:
"Hello, thank you for calling Kroll Receivables Intelligence. My name is Sarah — how may I assist you today?"
You must speak naturally and professionally, like a real treasury support representative on a live call. Never refer to yourself as an AI, assistant, or bot. Do not use headings or structured section titles in conversation.

---
SENTIMENT ANALYSIS & MONITORING
CRITICAL: You must continuously monitor and report customer sentiment throughout the conversation.
Sentiment Detection Rules:
1. Analyze sentiment after every customer response.
2. Call the reportSentiment tool whenever you detect the customer's emotional state.
3. Track sentiment changes and report mood shifts.
4. Adapt tone and pacing based on detected sentiment.
Sentiment Categories:
* positive
* neutral
* frustrated
* angry
* confused
* anxious
* satisfied
Call report_sentiment with:
* sentiment
* confidence (0.0–1.0)
* indicators
* recommendation (optional)
You must report sentiment:
* After the customer's initial explanation
* After presenting invoice findings
* After offering resolution
* During resolution processing
* After resolution is complete
* Whenever mood changes significantly
---
HANDLING INVOICE DISPUTES
If the customer reports a missing discount or overcharge amount:
1. Acknowledge with empathy.
2. Ask for the invoice number.
3. STOP and wait for response.
If the customer provides the invoice number:
1. Call report_sentiment.
2. Thank them.
3. Use the invnumber tool.
4. Say:
   "Thank you. I will now extract the details for Invoice #[NUMBER] and verify the pricing."
5. Narrate extraction steps briefly.
6. STOP after presenting findings.
If the customer does NOT know the invoice number:
1. Call report_sentiment.
2. Reassure them.
3. Use the dontknow tool to retrieve recent invoices silently.
4. Do NOT list all invoices.
5. Identify the most likely invoice confidently.
6. If the customer mentioned an overcharge amount, match against that value.
7. Say:
   "Thank you for waiting. I've identified invoice #[NUMBER], where the 15% contract discount was not applied."
8. Ask: "Would you like me to pull up the full details for this invoice?"
9. STOP and wait for customer confirmation.
10. ONLY when customer confirms, use the viewdetails tool to show full invoice details and then present the findings.
Do not present a list of five invoices.
Do not explain internal pricing file versions or backend system causes.
Do not mention root cause unless explicitly asked by the customer.
---
PRESENTING FINDINGS
Present clearly and concisely:
• Invoice billed amount
• Expected discounted amount
• Confirmed overcharge
If the customer provided an overcharge amount, confirm whether their calculation is correct.
After presenting findings:
* Call report_sentiment.
* STOP and wait.
---
RESOLUTION
Offer correction clearly:
"I sincerely apologize for the inconvenience. I can issue a credit memo for $[AMOUNT], update your pricing configuration and PO reference, and generate a revised invoice #[NUMBER]-REV. Shall I proceed?"
STOP immediately after asking.
Do not proceed until the customer explicitly confirms.
When confirmed:
1. Use clickcreditmemo tool and say: "I've started the credit memo process."
2. Use clickfixpobutton tool and say: "Now updating the system's pricing configuration and PO reference."
3. Use clickupdatedinvoice tool and say: "Generating and sending the corrected invoice to your billing contacts."
4. Use report_sentiment during processing.
After completion:
"Everything is now up to date.
✔ Credit memo issued
✔ Pricing & PO reference updated
✔ Revised invoice sent
Is there anything else I can assist you with today?"
Call report_sentiment again before closing.
---
CRITICAL CONVERSATIONAL PAUSE RULES
You must strictly follow these rules:
1. Always STOP after asking any question.
2. Never assume the customer's response.
3. Do not rush through multiple steps in one message.
4. After presenting findings, STOP.
5. After offering resolution, STOP.
6. Keep responses short and natural.
7. If you ask "Shall I proceed?" — STOP immediately.
If you ask a question, you must wait for the customer's response before continuing.`;

    // Client tools implementation
    const clientToolsRef = useRef({
      invnumber: async ({ invoice }: { invoice: string }) => {
        console.log('🚀 Tool invnumber called:', invoice);
        const val = String(invoice).replace(/[^0-9]/g, "");
        setInvoiceNumber(val);
        flowRef.current.invnumber = true;
        const inv = recentInvoices.find(i => i.number === val) || recentInvoices[3];
        setSelectedInvoice(inv);
        setCurrentPhase('invoice-detail');
        console.log('✅ Tool invnumber completed');
        return { ok: true };
      },
      dontknow: async ({ click }: { click: boolean }) => {
        console.log('🚀 Tool dontknow called:', click);
        setDontKnowInvoice(true);
        setCurrentPhase('loading-recent');

        for (let i = 0; i < loadingSteps.length; i++) {
          setLoadingSteps(prev => prev.map((step, idx) =>
            idx === i ? { ...step, status: 'loading' } : step
          ));
          await new Promise(r => setTimeout(r, 800));
          setLoadingSteps(prev => prev.map((step, idx) =>
            idx === i ? { ...step, status: 'complete' } : step
          ));
        }

        await new Promise(r => setTimeout(r, 400));
        setCurrentPhase('recent-invoices');
        console.log('✅ Tool dontknow completed');
        return { ok: true };
      },
      viewdetails: async ({ clicks, click }: { clicks?: boolean; click?: string }) => {
        console.log('🚀 Tool viewdetails called:', { clicks, click });
        const flaggedInvoice = recentInvoices.find(i => i.status === 'Flagged') || recentInvoices[3];
        setSelectedInvoice(flaggedInvoice);
        setInvoiceNumber(flaggedInvoice.number);
        setCurrentPhase('invoice-detail');
        flowRef.current.invnumber = true;
        console.log('✅ Tool viewdetails completed');
        return { ok: true };
      },
      clickcreditmemo: async ({ click }: { click: boolean }) => {
        console.log('🚀 Tool clickcreditmemo called:', click);
        setActionStates(prev => ({ ...prev, creditMemo: 'loading' }));
        await new Promise(r => setTimeout(r, 1000));
        setActionStates(prev => ({ ...prev, creditMemo: 'done' }));
        flowRef.current.creditmemo = true;
        console.log('✅ Credit memo completed');
        return { ok: true };
      },
      clickupdatedinvoice: async ({ click }: { click: boolean }) => {
        console.log('🚀 Tool clickupdatedinvoice called:', click);
        setActionStates(prev => ({ ...prev, updatedInvoice: 'loading' }));
        await new Promise(r => setTimeout(r, 1000));
        setActionStates(prev => ({ ...prev, updatedInvoice: 'done' }));
        flowRef.current.updatedinvoice = true;
        console.log('✅ Tool clickupdatedinvoice completed');
        return { ok: true };
      },
      clickfixpobutton: async ({ click }: { click: boolean }) => {
        console.log('🚀 Tool clickfixpobutton called:', click);
        setActionStates(prev => ({ ...prev, updatePO: 'loading' }));
        await new Promise(r => setTimeout(r, 1000));
        setActionStates(prev => ({ ...prev, updatePO: 'done' }));
        console.log('✅ Tool clickfixpobutton completed');
        return { ok: true };
      },
      startResolution: async ({ click }: { click: boolean }) => {
        console.log('🚀 Tool startResolution called:', click);
        await handleStartResolution();
        console.log('✅ Tool startResolution completed');
        return { ok: true };
      },
      report_sentiment: async (params: {
        sentiment: string;
        confidence?: number;
        indicators?: string[];
        recommendation?: string;
      }) => {
        console.log('🎭 Tool report_sentiment called:', params.sentiment, params);
        return { ok: true };
      },
      reportSentiment: async (params: any) => {
        console.log('🎭 Tool reportSentiment (fallback) called:', params.sentiment, params);
        return { ok: true };
      },
    });

    // Load ElevenLabs ConvAI widget script and configure client tools
    useEffect(() => {
      // Check if custom element or script already exists
      if (typeof window !== 'undefined' && (window as any).customElements && (window as any).customElements.get('elevenlabs-convai')) {
        console.log('🎙️ ElevenLabs custom element already defined');

        // Attach event listener to existing widget
        const widget = document.querySelector('elevenlabs-convai[agent-id="agent_4401kazwsr78etrvjdcdef110sbb"]');
        if (widget && !(widget as any)._clientToolsAttached) {
          console.log('🔗 Attaching tools to existing widget');
          (widget as any).addEventListener('elevenlabs-convai:call', (event: any) => {
            console.log('🎯 Call event fired - injecting client tools and system prompt');

            // Inject client tools
            event.detail.config.clientTools = {
              invnumber: async (data: any) => clientToolsRef.current.invnumber(data),
              dontknow: async (data: any) => clientToolsRef.current.dontknow(data),
              viewdetails: async (data: any) => clientToolsRef.current.viewdetails(data),
              clickcreditmemo: async (data: any) => clientToolsRef.current.clickcreditmemo(data),
              clickupdatedinvoice: async (data: any) => clientToolsRef.current.clickupdatedinvoice(data),
              clickfixpobutton: async (data: any) => clientToolsRef.current.clickfixpobutton(data),
              startResolution: async (data: any) => clientToolsRef.current.startResolution(data),
              report_sentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
              reportSentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
            };

            // Inject system prompt override
            if (!event.detail.config.overrides) {
              event.detail.config.overrides = {};
            }
            if (!event.detail.config.overrides.agent) {
              event.detail.config.overrides.agent = {};
            }
            event.detail.config.overrides.agent.prompt = { prompt: systemPromptOverride };

            console.log('✅ Client tools and system prompt injected');
          });
          (widget as any)._clientToolsAttached = true;
        }
        return;
      }

      const existingScript = document.querySelector('script[src*="elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        console.log('🎙️ ElevenLabs script already loaded - waiting for widget');

        // Wait for widget to appear and attach event listener
        const checkWidget = setInterval(() => {
          const widget = document.querySelector('elevenlabs-convai[agent-id="agent_4401kazwsr78etrvjdcdef110sbb"]');
          if (widget && !(widget as any)._clientToolsAttached) {
            console.log('🔗 Widget found - attaching event listener');
            clearInterval(checkWidget);

            (widget as any).addEventListener('elevenlabs-convai:call', (event: any) => {
              console.log('🎯 Call event fired - injecting client tools and system prompt');

              // Inject client tools
              event.detail.config.clientTools = {
                invnumber: async (data: any) => clientToolsRef.current.invnumber(data),
                dontknow: async (data: any) => clientToolsRef.current.dontknow(data),
                viewdetails: async (data: any) => clientToolsRef.current.viewdetails(data),
                clickcreditmemo: async (data: any) => clientToolsRef.current.clickcreditmemo(data),
                clickupdatedinvoice: async (data: any) => clientToolsRef.current.clickupdatedinvoice(data),
                clickfixpobutton: async (data: any) => clientToolsRef.current.clickfixpobutton(data),
                startResolution: async (data: any) => clientToolsRef.current.startResolution(data),
                report_sentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
                reportSentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
              };

              // Inject system prompt override
              if (!event.detail.config.overrides) {
                event.detail.config.overrides = {};
              }
              if (!event.detail.config.overrides.agent) {
                event.detail.config.overrides.agent = {};
              }
              event.detail.config.overrides.agent.prompt = { prompt: systemPromptOverride };

              console.log('✅ Client tools and system prompt injected');
            });
            (widget as any)._clientToolsAttached = true;
          }
        }, 200);

        setTimeout(() => clearInterval(checkWidget), 8000);
        return;
      }

      // Load the script for the first time
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';

      script.onload = () => {
        console.log('🎙️ ElevenLabs ConvAI script loaded - waiting for widget');

        // Wait for widget to appear in DOM
        const checkWidget = setInterval(() => {
          const widget = document.querySelector('elevenlabs-convai[agent-id="agent_4401kazwsr78etrvjdcdef110sbb"]');
          if (widget) {
            console.log('🔗 Widget found - attaching event listener');
            clearInterval(checkWidget);

            // Listen for the call event and inject client tools
            (widget as any).addEventListener('elevenlabs-convai:call', (event: any) => {
              console.log('🎯 Call event fired - injecting client tools and system prompt');

              // Inject client tools
              event.detail.config.clientTools = {
                invnumber: async (data: any) => clientToolsRef.current.invnumber(data),
                dontknow: async (data: any) => clientToolsRef.current.dontknow(data),
                viewdetails: async (data: any) => clientToolsRef.current.viewdetails(data),
                clickcreditmemo: async (data: any) => clientToolsRef.current.clickcreditmemo(data),
                clickupdatedinvoice: async (data: any) => clientToolsRef.current.clickupdatedinvoice(data),
                clickfixpobutton: async (data: any) => clientToolsRef.current.clickfixpobutton(data),
                startResolution: async (data: any) => clientToolsRef.current.startResolution(data),
                report_sentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
                reportSentiment: async (data: any) => clientToolsRef.current.report_sentiment(data),
              };

              // Inject system prompt override
              if (!event.detail.config.overrides) {
                event.detail.config.overrides = {};
              }
              if (!event.detail.config.overrides.agent) {
                event.detail.config.overrides.agent = {};
              }
              event.detail.config.overrides.agent.prompt = { prompt: systemPromptOverride };

              console.log('✅ Client tools and system prompt injected');
            });
            (widget as any)._clientToolsAttached = true;
          }
        }, 200);

        setTimeout(() => clearInterval(checkWidget), 8000);
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup if needed
      };
    }, []);

    const handleDontKnowInvoice = async () => {
      setDontKnowInvoice(true);
      setCurrentPhase('loading-recent');

      for (let i = 0; i < loadingSteps.length; i++) {
        setLoadingSteps(prev => prev.map((step, idx) =>
          idx === i ? { ...step, status: 'loading' } : step
        ));
        await new Promise(r => setTimeout(r, 800));
        setLoadingSteps(prev => prev.map((step, idx) =>
          idx === i ? { ...step, status: 'complete' } : step
        ));
      }

      await new Promise(r => setTimeout(r, 400));
      setCurrentPhase('recent-invoices');
    };

    const handleViewInvoiceDetails = (invoice: any) => {
      setSelectedInvoice(invoice);
      setInvoiceNumber(invoice.number);
      setCurrentPhase('invoice-detail');
    };

    const handleStartResolution = async () => {
      setCurrentPhase('resolving');

      for (let i = 0; i < executionSteps.length; i++) {
        setExecutionSteps(prev => prev.map((step, idx) =>
          idx === i ? { ...step, status: 'loading' } : step
        ));

        if (i === 0) setActionStates(prev => ({ ...prev, creditMemo: 'loading' }));
        if (i === 2) setActionStates(prev => ({ ...prev, updatePO: 'loading' }));
        if (i === 3) setActionStates(prev => ({ ...prev, updatedInvoice: 'loading' }));

        await new Promise(r => setTimeout(r, 1200));

        setExecutionSteps(prev => prev.map((step, idx) =>
          idx === i ? { ...step, status: 'complete' } : step
        ));

        if (i === 0) {
          setActionStates(prev => ({ ...prev, creditMemo: 'done' }));
          setActivities(prev => prev.map(a => a.id === '3' ? { ...a, status: 'complete', time: 'Just now' } : a));
        }
        if (i === 2) setActionStates(prev => ({ ...prev, updatePO: 'done' }));
        if (i === 3) setActionStates(prev => ({ ...prev, updatedInvoice: 'done' }));
        if (i === 4) {
          setActivities(prev => prev.map(a => a.id === '4' ? { ...a, status: 'complete', time: 'Just now' } : a));
        }
      }

      await new Promise(r => setTimeout(r, 500));
      setCurrentPhase('resolved');
    };

    const handleReset = () => {
      setInvoiceNumber('');
      setDontKnowInvoice(false);
      setCurrentPhase('search');
      setSelectedInvoice(null);
      setSelectedTab('invoice');
      setLoadingSteps([
        { id: 'connect', label: 'Connected to billing database', status: 'pending' },
        { id: 'loading', label: 'Loading documents', status: 'pending' },
        { id: 'metadata', label: 'Extracting metadata (amount, discount status)', status: 'pending' },
        { id: 'eligibility', label: 'Checking discount eligibility per cycle', status: 'pending' },
      ]);
      setExecutionSteps([
        { id: 'credit', label: 'Applying credit memo', status: 'pending' },
        { id: 'recalc', label: 'Recalculating invoice', status: 'pending' },
        { id: 'po', label: 'Updating PO reference', status: 'pending' },
        { id: 'generate', label: 'Generating revised invoice', status: 'pending' },
        { id: 'send', label: 'Sending invoice to billing contacts', status: 'pending' },
      ]);
      setActivities([
        { id: '1', action: 'Discrepancy detected', time: '2 minutes ago', status: 'complete' },
        { id: '2', action: 'Investigation completed', time: '1 minute ago', status: 'complete' },
        { id: '3', action: 'Credit memo applied', time: 'Just now', status: 'pending' },
        { id: '4', action: 'Invoice updated and sent', time: 'Pending', status: 'pending' },
      ]);
      setActionStates({ creditMemo: 'idle', updatedInvoice: 'idle', updatePO: 'idle', monitoring: 'idle' });
    };

    const handleSearch = async () => {
      if (!invoiceNumber.trim()) return;
      const inv = recentInvoices.find(i => i.number === invoiceNumber);
      if (inv) {
        handleViewInvoiceDetails(inv);
      } else {
        handleViewInvoiceDetails(recentInvoices[3]);
      }
    };

    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      {/* ElevenLabs ConvAI Widget */}
      {typeof window !== 'undefined' && (
        /* @ts-ignore */
        <elevenlabs-convai agent-id="agent_4401kazwsr78etrvjdcdef110sbb"></elevenlabs-convai>
      )}

      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00263A] flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-base font-semibold">Get Assistance</h1>
              <p className="text-slate-500 text-sm">{helpMode === 'assist' ? 'Automated invoice extraction and analysis' : 'Architecture, risk tiers, and agent catalog'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHelpMode('assist')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${helpMode === 'assist' ? 'bg-[#00263A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Assist</button>
            <button onClick={() => setHelpMode('architecture')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${helpMode === 'architecture' ? 'bg-[#00263A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Architecture &amp; governance</button>
          </div>
          {helpMode === 'assist' && currentPhase !== 'search' && (
            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <X className="w-3.5 h-3.5" />
              New Search
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {helpMode === 'architecture' && (
          <div className="max-w-4xl space-y-10">
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Target reference architecture (logical)</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                <li><strong>Ingestion &amp; normalisation:</strong> Parse camt.053, MT940, BAI2 and remittance channels; produce canonical BankLine and Remittance objects.</li>
                <li><strong>Event backbone:</strong> Publish BankLineReceived, RemittanceReceived, CaseUpdated; pub/sub with dead-lettering.</li>
                <li><strong>Case orchestration:</strong> Long-running workflows (e.g. Durable Functions) for missing remittance follow-up, dispute resolution.</li>
                <li><strong>Agent runtime:</strong> Foundry Agent Service — conversations, state, tool calls, content safety, identity, observability.</li>
                <li><strong>Tool gateway:</strong> API Management — authN/authZ, rate limiting, transformation, logging.</li>
                <li><strong>Human workbench:</strong> Queues, approvals, evidence views with &quot;why&quot; rationales; one-click acceptance.</li>
                <li><strong>Observability:</strong> Application Insights, OpenTelemetry, agent monitoring.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Human-in-the-loop rules and risk tiers</h2>
              <p className="text-sm text-slate-600 mb-4">A deterministic Risk Engine gates automation. Initial tiering is conservative; expanded as controls prove effective.</p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700">Risk tier</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Characteristics</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Allowed automation</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Typical approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="px-4 py-3 font-medium">Tier 0 (Assist)</td><td className="px-4 py-3 text-slate-600">High uncertainty or high impact</td><td className="px-4 py-3 text-slate-600">Suggestions only; no external writes</td><td className="px-4 py-3 text-slate-600">Analyst approves every action</td></tr>
                    <tr><td className="px-4 py-3 font-medium">Tier 1 (Draft)</td><td className="px-4 py-3 text-slate-600">Medium confidence, moderate impact</td><td className="px-4 py-3 text-slate-600">Draft emails/tasks; propose match plans</td><td className="px-4 py-3 text-slate-600">Human sends emails; human posts to D365</td></tr>
                    <tr><td className="px-4 py-3 font-medium">Tier 2 (Controlled auto)</td><td className="px-4 py-3 text-slate-600">High confidence + low impact + stable counterparty</td><td className="px-4 py-3 text-slate-600">Auto-post low-value/high-confidence; auto-route routine disputes</td><td className="px-4 py-3 text-slate-600">Post-action sampling audit + rollback playbook</td></tr>
                    <tr><td className="px-4 py-3 font-medium">Tier 3 (Scaled agentic)</td><td className="px-4 py-3 text-slate-600">Proven controls; mature monitoring</td><td className="px-4 py-3 text-slate-600">Auto-resolve high-volume classes; limited auto-send for low-risk templates</td><td className="px-4 py-3 text-slate-600">Continuous controls testing; tighter change management</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-3">Governance remains visible; consent and proper server implementations are key for tool-connected conversations.</p>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Agent catalog</h2>
              <p className="text-sm text-slate-600 mb-4">Agents used across Cash Applications, Disputes, Calls, and PTP. You see their outputs and risk tiers throughout this app.</p>
              <div className="space-y-4">
                {[
                  { name: 'Bank Statement Normaliser', resp: 'Parse/normalise camt.053, MT940, BAI2; enrich payer identity.', out: 'Canonical BankLine; parsing diagnostics.', thresh: 'Parsing success ≥ 0.995 else quarantine.' },
                  { name: 'Remittance Ingestion & Decoding Agent', resp: 'Decode EDI 820 / NACHA addenda; extract invoice refs/amounts.', out: 'Structured Remittance JSON with field confidence.', thresh: 'Critical fields ≥ 0.90 to use without review.' },
                  { name: 'Payment Matching Agent', resp: 'Match proposals (1-to-1, 1-to-many), partial allocation, tolerance checks.', out: 'Ranked match plan + confidence + explanation.', thresh: 'Auto-post ≥ 0.97; Recommend 0.80–0.97; Escalate &lt; 0.80.' },
                  { name: 'FX & Currency Resolution Agent', resp: 'Identify currency/FX mismatches; compute expected FX variance.', out: 'Proposed posting adjustments; variance classification.', thresh: 'Auto-adjust only if within tolerance and Tier permits.' },
                  { name: 'Short/Over-pay & Withholding Agent', resp: 'Detect deduction patterns; request docs; propose dispute/adjustment.', out: 'Deduction reason code; next-action package.', thresh: 'Auto-code ≥ 0.92 for known patterns; else review.' },
                  { name: 'Customer Communications Agent', resp: 'Draft missing remittance clarifications; draft deduction requests; log comms.', out: 'Draft email; structured summary/action items.', thresh: 'MVP: draft-only; later auto-send for Tier-1 templates.' },
                  { name: 'Collections Triage Agent', resp: 'Classify inbound emails; summarize threads; propose next best action.', out: 'Intent label; summary; NBA; task recommendations.', thresh: 'Auto-task ≥ 0.90; escalate uncertain threads.' },
                  { name: 'Call Intelligence Agent', resp: 'Transcribe and summarize calls; QA checklist; call prep briefs.', out: 'Transcript; call summary; QA flags.', thresh: 'Summary acceptance tracked; no auto-posting.' },
                  { name: 'Dispute Triage & Routing Agent', resp: 'Classify disputes (pricing, duplicate, chargeback, etc.); route with evidence.', out: 'Dispute case package; routing decision + SLA.', thresh: 'Auto-route ≥ 0.92 for top categories.' },
                  { name: 'Portal Delivery Agent', resp: 'Upload invoices to portals via API/UI automation; capture proof.', out: 'Submission receipt; screenshot hash; status.', thresh: 'Auto-run with retry; escalate on repeated failures.' },
                ].map((agent, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <h4 className="font-semibold text-slate-800">{agent.name}</h4>
                    <p className="text-xs text-slate-600 mt-1"><strong>Responsibilities:</strong> {agent.resp}</p>
                    <p className="text-xs text-slate-600 mt-0.5"><strong>Outputs:</strong> {agent.out}</p>
                    <p className="text-xs text-slate-500 mt-0.5"><strong>Thresholds:</strong> {agent.thresh}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'search' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#00263A] rounded-sm"></div>
              <h3 className="text-slate-800 text-base font-semibold">Invoice Lookup</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="max-w-3xl">
                <label className="block text-base font-medium text-slate-800 mb-3">Enter Invoice Number</label>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g., 54829"
                      className="w-full px-5 py-3.5 text-lg border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00263A] focus:border-transparent"
                    />
                  </div>
                  <button onClick={handleSearch} className="px-8 py-3.5 bg-[#00263A] text-white rounded-lg hover:bg-[#003354] transition-colors flex items-center gap-2 text-base font-medium">
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </button>
                </div>

                <button onClick={handleDontKnowInvoice} className="text-[#00263A] text-sm font-medium hover:underline flex items-center gap-2">
                  <FileSearch className="w-4 h-4" />
                  I don't know my invoice number
                </button>
              </div>
            </div>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'loading-recent' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#00263A] rounded-sm"></div>
              <h3 className="text-slate-800 text-base font-semibold">Retrieving Recent Invoices for MetroTech Supplies…</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <div>
                  <div className="text-lg font-medium text-slate-800">Loading invoice data</div>
                  <div className="text-sm text-slate-500">Please wait while we retrieve your recent invoices...</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {loadingSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-4 py-4 px-5 rounded-lg bg-slate-50 border border-slate-200">
                    {step.status === 'pending' && <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                    {step.status === 'loading' && <Loader className="w-6 h-6 text-blue-600 animate-spin" />}
                    {step.status === 'complete' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                    <span className={`text-base ${step.status === 'complete' ? 'text-emerald-700 font-medium' : step.status === 'loading' ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'recent-invoices' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#00263A] rounded-sm"></div>
              <h3 className="text-slate-800 text-base font-semibold">Recent Invoices for MetroTech Supplies</h3>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Invoices</h3>
                  <span className="text-xs text-slate-500">Customer: MetroTech Supplies</span>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Discount Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">State</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.number} className={invoice.status === 'Flagged' ? 'bg-amber-50' : 'bg-white hover:bg-slate-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">#{invoice.number}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-900 font-medium">{invoice.amount}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${invoice.status === 'Closed' ? 'bg-slate-200 text-slate-800' :
                          invoice.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-200 text-orange-800 border border-orange-400'
                          }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center gap-2 ${invoice.discountStatus === 'Discount Applied' ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                          {invoice.discountStatus === 'Discount Applied' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          <span className="font-semibold">{invoice.discountStatus}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {invoice.state === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 inline-block" />}
                        {invoice.state === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-600 inline-block" />}
                        {invoice.state === 'pending' && <Clock className="w-5 h-5 text-blue-600 inline-block" />}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {invoice.status === 'Flagged' ? (
                          <button onClick={() => handleViewInvoiceDetails(invoice)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00263A] text-white rounded-md text-sm font-semibold hover:bg-[#003354] shadow-sm">
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'invoice-detail' && (
          <div className="p-6 bg-slate-50 min-h-full">
            <div className="max-w-5xl mx-auto space-y-5">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Invoice #54829</h2>
                      <p className="text-sm text-slate-500">MetroTech Supplies</p>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">HIGH PRIORITY</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={handleStartResolution} disabled={actionStates.creditMemo !== 'idle'} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${actionStates.creditMemo === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#00263A] text-white hover:bg-[#003354]'
                      }`}>
                      {actionStates.creditMemo === 'done' ? <CheckCircle className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      Credit Memo
                    </button>
                    <button disabled={actionStates.updatedInvoice !== 'idle' || actionStates.creditMemo === 'idle'} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${actionStates.updatedInvoice === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : actionStates.creditMemo === 'idle' ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}>
                      {actionStates.updatedInvoice === 'done' ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      Send Invoice
                    </button>
                    <button disabled={actionStates.updatePO !== 'idle' || actionStates.creditMemo === 'idle'} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${actionStates.updatePO === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : actionStates.creditMemo === 'idle' ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}>
                      {actionStates.updatePO === 'done' ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      Fix PO
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Billed Amount</div>
                  <div className="text-lg font-semibold text-red-600">$128,600</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contract Discount</div>
                  <div className="text-sm font-semibold text-[#00263A]">15%</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Correct Amount</div>
                  <div className="text-lg font-semibold text-emerald-600">$109,310</div>
                </div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                  <div className="text-xs text-orange-600 uppercase tracking-wide mb-1">Overcharge</div>
                  <div className="text-lg font-semibold text-orange-600">$19,290</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800"><strong>Root Cause:</strong> Pricing file mismatch (v5 vs v6) - Contract discount was not applied</span>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Document Comparison</h3>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {(['invoice', 'contract', 'po', 'attachments', 'history'] as const).map((tab) => (
                      <button key={tab} onClick={() => setSelectedTab(tab)} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-red-200 rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-2.5 flex items-center justify-between border-b border-red-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">Invoice #54829</span>
                          <span className="px-1.5 py-0.5 bg-red-200 text-red-700 text-xs rounded font-medium">Incorrect</span>
                        </div>
                        <Download className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700" />
                      </div>
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-slate-500 text-xs uppercase">
                              <th className="text-left pb-2 font-medium">Item</th>
                              <th className="text-right pb-2 font-medium">Price</th>
                              <th className="text-right pb-2 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-slate-100">
                              <td className="py-3 text-slate-900">Enterprise License × 100</td>
                              <td className="py-3 text-right">
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">$1,286</span>
                              </td>
                              <td className="py-3 text-right font-bold text-red-600">$128,600</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                          <span className="text-slate-500">Discount</span>
                          <span className="font-medium text-red-600">None</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-emerald-200 rounded-lg overflow-hidden">
                      <div className="bg-emerald-50 px-4 py-2.5 flex items-center justify-between border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-emerald-800">PO #MT-4481-02</span>
                          <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-700 text-xs rounded font-medium">Correct</span>
                        </div>
                        <Download className="w-4 h-4 text-emerald-500 cursor-pointer hover:text-emerald-700" />
                      </div>
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-slate-500 text-xs uppercase">
                              <th className="text-left pb-2 font-medium">Item</th>
                              <th className="text-right pb-2 font-medium">Price</th>
                              <th className="text-right pb-2 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-slate-100">
                              <td className="py-3 text-slate-900">Enterprise License × 100</td>
                              <td className="py-3 text-right">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">$1,093</span>
                              </td>
                              <td className="py-3 text-right font-bold text-emerald-600">$109,310</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                          <span className="text-slate-500">Discount</span>
                          <span className="font-medium text-emerald-600">15%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-center">
                    <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-5 py-2">
                      <span className="text-red-600 font-bold">$128,600</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-emerald-600 font-bold">$109,310</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-orange-600 font-bold">$19,290 overcharge</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Activity Timeline</h3>
                <div className="flex items-center gap-4">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.status === 'complete' ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                        {activity.status === 'complete' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${activity.status === 'complete' ? 'text-slate-900' : 'text-slate-400'}`}>
                          {activity.action}
                        </div>
                        <div className="text-xs text-slate-500">{activity.time}</div>
                      </div>
                      {idx < activities.length - 1 && (
                        <div className={`w-12 h-0.5 ${activity.status === 'complete' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'resolving' && (
          <div className="p-4">
            <div className="max-w-xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Processing Resolution</h3>
                      <p className="text-sm text-slate-500">Executing automated fixes...</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-500 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((executionSteps.filter(s => s.status === 'complete').length / executionSteps.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(executionSteps.filter(s => s.status === 'complete').length / executionSteps.length) * 100}%` }} />
                    </div>
                  </div>

                  {executionSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 py-3 px-4 rounded-lg bg-slate-50 border border-slate-200">
                      {step.status === 'pending' && <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                      {step.status === 'loading' && <Loader className="w-6 h-6 text-blue-500 animate-spin" />}
                      {step.status === 'complete' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                      <span className={`text-base ${step.status === 'complete' ? 'text-emerald-700 font-medium' :
                        step.status === 'loading' ? 'text-blue-600 font-medium' :
                          'text-slate-400'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {helpMode === 'assist' && currentPhase === 'resolved' && (
          <div className="p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-emerald-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">Dispute Resolved</h2>
                        <p className="text-white/80 text-sm">All actions completed successfully</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/20">
                      <span className="text-xs font-bold text-white">RESOLVED</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: CreditCard, label: 'Credit memo issued', value: '$19,290', color: 'emerald' },
                      { icon: Send, label: 'Revised invoice sent', value: '#54829-REV', color: 'blue' },
                      { icon: FileText, label: 'PO aligned to pricing file', value: 'v6', color: 'purple' },
                      { icon: Monitor, label: 'Discount monitoring', value: 'Enabled', color: 'emerald' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-${item.color}-100`}>
                            <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-500">{item.label}</p>
                            <p className="font-bold text-slate-800">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleReset} className="flex-1 px-6 py-3 border border-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                      Close Case
                    </button>
                    <button className="px-6 py-3 rounded-lg font-semibold text-white bg-[#00263A] flex items-center gap-2 transition-colors hover:bg-[#003354]">
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>;
  };

  return <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
    <Sidebar />

    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <AnimatePresence mode="wait">
        {currentView === 'overview' && <MainDashboardView key="overview" />}
        {currentView === 'dashboard' && <DashboardView key="dashboard" />}
        {currentView === 'ai-processing' && <AIProcessingView key="ai-processing" />}
        {currentView === 'exception-workbench' && <ExceptionWorkbenchView key="exception-workbench" />}
        {currentView === 'posting' && <PostingView key="posting" />}
        {currentView === 'success' && <SuccessView key="success" />}
        {currentView === 'call-analysis' && <CallAnalysisView key="call-analysis" sentimentHistory={sentimentHistory} sentimentTimelineRef={sentimentTimelineRef} />}
        {currentView === 'disputes' && <DisputesView key="disputes" />}
        {currentView === 'ptp' && <PromiseToPayView key="ptp" />}
        {currentView === 'customer-master' && <CustomerMasterDataView key="customer-master" />}
        {currentView === 'qa' && <QAView key="qa" />}
        {currentView === 'invoice-delivery' && (
          <InvoiceDeliveryView
            key="invoice-delivery"
            onPostedToD365={() => {
              setCurrentView('dashboard');
            }}
          />
        )}
        {currentView === 'help' && <HelpView key="help" />}
      </AnimatePresence>
    </main>
  </div>
};