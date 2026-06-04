import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Brain,
  FileText,
  Upload,
  Building2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ClipboardCheck,
  UserCheck,
  Shield,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INVOICE_DELIVERY_STEPS = [
  { id: 1, title: 'Invoice Approved in D365', details: ['D365 billing approval triggers delivery agent'] },
  { id: 2, title: 'Check Client Portal Requirement', details: ['Verify Ariba access & PO linkage'] },
  { id: 3, title: 'Validate Invoice Data', details: ['Matter code, billing entity, tax & schema checks'] },
  { id: 4, title: 'Submit to SAP Ariba', details: ['Upload & submit invoice to client portal'] },
  { id: 5, title: 'Capture Status + Evidence', details: ['Record outcomes & store audit evidence'] },
  { id: 6, title: 'Exception Handling', details: ['Rejections, rework, controlled retries'] },
  { id: 7, title: 'Trigger Status Identified', details: ['Root cause & resolution routing'] },
  { id: 8, title: 'Post to D365', details: ['Final AR posting & revenue recognition'] },
];

// Shared sub-components aligned to dashboard typography
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{children}</span>
);

const PanelHeader: React.FC<{ icon: React.ReactNode; title: string; sub: string; kroll?: boolean }> = ({ icon, title, sub, kroll }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`p-2 rounded-lg ${kroll ? 'bg-[#E8F0F5]' : 'bg-slate-100'}`}>
      <span className={kroll ? 'text-[#00263A]' : 'text-slate-600'}>{icon}</span>
    </div>
    <div>
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
);

const DataTable: React.FC<{ rows: { field: string; value: string; highlight?: boolean }[] }> = ({ rows }) => (
  <div className="divide-y divide-slate-100">
    {rows.map((row, i) => (
      <div key={i} className="flex justify-between py-2">
        <span className="text-xs text-slate-500">{row.field}</span>
        <span className={`text-xs font-semibold ${row.highlight ? 'text-[#00263A]' : 'text-slate-800'}`}>{row.value}</span>
      </div>
    ))}
  </div>
);

const CardBlock: React.FC<{ title: string; children: React.ReactNode; accent?: 'emerald' | 'amber' | 'navy' | 'red' }> = ({ title, children, accent }) => {
  const headerCls = accent === 'emerald' ? 'bg-emerald-50 border-b border-emerald-200' :
    accent === 'amber' ? 'bg-amber-50 border-b border-amber-200' :
    accent === 'navy' ? 'bg-[#00263A] border-b border-[#001F2E]' :
    accent === 'red' ? 'bg-rose-50 border-b border-rose-200' :
    'bg-slate-50 border-b border-slate-200';
  const titleCls = accent === 'emerald' ? 'text-emerald-800' :
    accent === 'amber' ? 'text-amber-800' :
    accent === 'navy' ? 'text-white' :
    accent === 'red' ? 'text-rose-800' :
    'text-slate-600';
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className={`px-4 py-2.5 ${headerCls}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${titleCls}`}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

const CheckItem: React.FC<{ text: string; warn?: boolean }> = ({ text, warn }) => (
  <div className="flex items-start gap-2">
    {warn
      ? <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
      : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
    <span className="text-xs text-slate-700">{text}</span>
  </div>
);

export const InvoiceDeliveryView: React.FC<{ onPostedToD365?: () => void }> = ({ onPostedToD365 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [showApprovedPopup, setShowApprovedPopup] = useState(false);
  const totalSteps = INVOICE_DELIVERY_STEPS.length;

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const handleApprove = () => { setIsApproved(true); setShowApprovedPopup(true); };
  const handlePopupOk = () => { setShowApprovedPopup(false); onPostedToD365?.(); };

  const steps = INVOICE_DELIVERY_STEPS;

  return (
    <>
      {showApprovedPopup && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 2147483647 }}
          onClick={() => setShowApprovedPopup(false)} role="dialog" aria-modal="true" aria-labelledby="popup-title">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 id="popup-title" className="text-sm font-semibold text-slate-800 mb-1">Posted to D365</h2>
            <p className="text-xs text-slate-500 mb-4">AR ledger entries created · Revenue recognition triggered · Audit trail complete</p>
            <button onClick={handlePopupOk}
              className="px-6 py-2 bg-[#00263A] text-white rounded-lg text-xs font-semibold hover:bg-[#003354] transition-colors">
              Confirm
            </button>
          </div>
        </div>,
        document.getElementById('portal-root') || document.body
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">

        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-800">Invoice Delivery</h1>
                <span className="text-[10px] font-semibold text-[#7AADCB] bg-[#00263A] px-2 py-0.5 rounded-full">Kroll Billing Intelligence</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Pinnacle Capital Partners LLC · Matter KRL-MAT-2025-0847 · Valuation Advisory · SAP Ariba → D365</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span>3 invoices · $180,000 total</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Audit trail active</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5.5rem]">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mb-0.5 transition-all flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-[#00263A] text-white ring-2 ring-[#7AADCB]/30' :
                      'bg-slate-200 text-slate-500'}`}>
                      {isCompleted ? <Check className="w-2.5 h-2.5" /> : step.id}
                    </div>
                    <span className={`text-[8px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 ${
                      isActive ? 'text-[#00263A]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-16px]">
                      <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Step 1: Invoice Approved in D365 */}
            {currentStep === 0 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<FileText className="w-4 h-4" />} title="Billing Record — Kroll D365" sub="Engagement billing approved for portal delivery" />
                    <CardBlock title="Engagement Details">
                      <DataTable rows={[
                        { field: 'Client', value: 'Pinnacle Capital Partners LLC', highlight: true },
                        { field: 'Client Type', value: 'Private Equity — Portfolio Valuation' },
                        { field: 'Matter', value: 'KRL-MAT-2025-0847' },
                        { field: 'Engagement Partner', value: 'Michael Thornton, MD — Valuation Advisory' },
                        { field: 'Billing Entity', value: 'Kroll, LLC (Delaware)' },
                        { field: 'Service Line', value: 'Valuation Advisory · Transaction Advisory · Restructuring' },
                        { field: 'Delivery Method', value: 'SAP Ariba Network (client-mandated)' },
                        { field: 'Payment Terms', value: 'Net 30 · Due Apr 15, 2026' },
                      ]} />
                    </CardBlock>
                    <CardBlock title="Invoices Queued for Delivery">
                      <DataTable rows={[
                        { field: 'KRL-INV-4821', value: 'Valuation Advisory — Q1 2026 · $95,000' },
                        { field: 'KRL-INV-4822', value: 'Transaction Due Diligence — Phase 2 · $55,000' },
                        { field: 'KRL-INV-4823', value: 'Restructuring Advisory · $30,000' },
                        { field: 'Total', value: '$180,000', highlight: true },
                      ]} />
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="D365 Billing Agent — Trigger Fired" sub="Approval captured · delivery routing initiated" kroll />
                    <CardBlock title="Approval Checks Passed" accent="emerald">
                      <div className="space-y-2.5">
                        <CheckItem text="Engagement partner sign-off confirmed — Michael Thornton" />
                        <CheckItem text="D365 billing approval status: Approved" />
                        <CheckItem text="Revenue recognition schedule validated (ASC 606)" />
                        <CheckItem text="Client mandates SAP Ariba — portal delivery agent selected" />
                        <CheckItem text="3 invoices queued for Ariba submission" />
                      </div>
                    </CardBlock>
                    <div className="bg-[#F0F5F8] border border-[#C5D8E4] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-3.5 h-3.5 text-[#00263A]" />
                        <SectionLabel>Kroll AI — System Message</SectionLabel>
                      </div>
                      <p className="text-xs text-[#00263A] leading-relaxed">
                        D365 billing approval received for matter KRL-MAT-2025-0847. Pinnacle Capital Partners requires SAP Ariba submission. Invoice delivery agent triggered — proceeding to portal access verification.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-[#00263A]" />
                      <span className="text-[10px] text-slate-500">Kroll advisory-grade workflow · independent · audit-ready</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Check Client Portal Requirement */}
            {currentStep === 1 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<UserCheck className="w-4 h-4" />} title="Client Portal Access Record" sub="SAP Ariba supplier account verification" />
                    <CardBlock title="Portal Configuration — Pinnacle Capital Partners">
                      <DataTable rows={[
                        { field: 'Client', value: 'Pinnacle Capital Partners LLC' },
                        { field: 'Portal', value: 'SAP Ariba Network', highlight: true },
                        { field: 'Kroll Supplier ANID', value: 'AN01234567890-T' },
                        { field: 'Ariba Account Status', value: 'Active — Enabled' },
                        { field: 'Onboarded', value: 'Oct 14, 2022' },
                        { field: 'PO Required', value: 'Yes — per client billing policy' },
                        { field: 'Linked PO', value: 'PO-4500091827 (Kroll Advisory Services 2025–2026)' },
                      ]} />
                    </CardBlock>
                    <CardBlock title="Invoice-to-PO Mapping">
                      <DataTable rows={[
                        { field: 'KRL-INV-4821', value: 'PO-4500091827 — Line 1 · $95,000' },
                        { field: 'KRL-INV-4822', value: 'PO-4500091827 — Line 2 · $55,000' },
                        { field: 'KRL-INV-4823', value: 'PO-4500091827 — Line 3 · $30,000' },
                      ]} />
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Portal Access Validation" sub="Ariba account active · PO linkage confirmed" kroll />
                    <CardBlock title="Validation Results" accent="emerald">
                      <div className="space-y-2.5">
                        <CheckItem text="Kroll Ariba supplier account active (ANID: AN01234567890-T)" />
                        <CheckItem text="Pinnacle Capital Partners Ariba buyer network — connected" />
                        <CheckItem text="PO-4500091827 located · 3 open lines · amounts match" />
                        <CheckItem text="Ariba invoice submission rules retrieved" />
                        <CheckItem text="PDF + XML dual-format requirement confirmed" />
                      </div>
                    </CardBlock>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">If Portal Access Not Available</p>
                      <ul className="text-xs text-amber-800 space-y-1.5">
                        <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span>AI initiates Ariba supplier onboarding workflow</li>
                        <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span>Drafts onboarding request to Pinnacle Capital AP team</li>
                        <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span>Tracks onboarding confirmation and ANID issuance</li>
                        <li className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">•</span>Updates D365 billing record and notifies engagement partner</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Validate Invoice Data */}
            {currentStep === 2 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<ClipboardCheck className="w-4 h-4" />} title="Invoice Pack — Pre-Submission" sub="3 Kroll advisory invoices awaiting validation" />
                    <CardBlock title="Invoice Summary">
                      <div className="space-y-3">
                        {[
                          { id: 'KRL-INV-4821', service: 'Valuation Advisory — PE Portfolio Q1 2026', amount: '$95,000', po: 'PO-4500091827 · Line 1', status: 'Ready' },
                          { id: 'KRL-INV-4822', service: 'Transaction Due Diligence — Phase 2', amount: '$55,000', po: 'PO-4500091827 · Line 2', status: 'Ready' },
                          { id: 'KRL-INV-4823', service: 'Restructuring Advisory', amount: '$30,000', po: 'PO-4500091827 · Line 3', status: 'Ready' },
                        ].map((inv) => (
                          <div key={inv.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-800">{inv.id}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{inv.status}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{inv.service}</div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-slate-400">{inv.po}</span>
                              <span className="text-xs font-semibold text-[#00263A]">{inv.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Pre-Submission Validation" sub="Schema, business rules & compliance checks" kroll />
                    <CardBlock title="Validation Results — All Pass" accent="emerald">
                      <div className="space-y-2.5">
                        <CheckItem text="Matter code KRL-MAT-2025-0847 — active & billable" />
                        <CheckItem text="Engagement partner sign-off present on all 3 invoices" />
                        <CheckItem text="Billing entity: Kroll, LLC (Delaware) — correct for US engagement" />
                        <CheckItem text="Tax codes: US domestic services — validated against D365" />
                        <CheckItem text="Ariba XML schema compliance — PDF + cXML format confirmed" />
                        <CheckItem text="PO references present on all 3 invoices" />
                        <CheckItem text="Invoice amounts within PO line authorisation limits" />
                      </div>
                    </CardBlock>
                    <div className="bg-[#F0F5F8] border border-[#C5D8E4] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-3.5 h-3.5 text-[#00263A]" />
                        <SectionLabel>Kroll AI — Validation Note</SectionLabel>
                      </div>
                      <p className="text-xs text-[#00263A] leading-relaxed">
                        All 3 invoices pass Kroll billing policy and SAP Ariba submission rules. No data enrichment required. Proceeding to Ariba upload.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: Submit to SAP Ariba */}
            {currentStep === 3 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<Upload className="w-4 h-4" />} title="Ariba Upload Queue" sub="Kroll submitting 3 invoices to Pinnacle Capital Ariba" />
                    <CardBlock title="Submission Queue — SAP Ariba Network">
                      <DataTable rows={[
                        { field: 'KRL-INV-4821', value: 'Queued · $95,000' },
                        { field: 'KRL-INV-4822', value: 'Queued · $55,000 · PO line 2' },
                        { field: 'KRL-INV-4823', value: 'Queued · $30,000' },
                        { field: 'Target Portal', value: 'SAP Ariba Network', highlight: true },
                        { field: 'Buyer AN ID', value: 'AN98765432100-T (Pinnacle Capital)' },
                        { field: 'Supplier AN ID', value: 'AN01234567890-T (Kroll)' },
                        { field: 'Format', value: 'PDF + cXML (Ariba standard)' },
                      ]} />
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Ariba Submission — In Progress" sub="AI navigating Ariba portal end-to-end" kroll />
                    <CardBlock title="Submission Progress">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs text-slate-700">Ariba login — Kroll supplier account authenticated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs text-slate-700">Buyer workspace located — Pinnacle Capital Partners</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs text-slate-700">PO-4500091827 matched — invoice lines mapped</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 text-[#00263A] animate-spin flex-shrink-0" />
                          <span className="text-xs text-slate-700">Uploading KRL-INV-4821, KRL-INV-4822, KRL-INV-4823…</span>
                        </div>
                      </div>
                    </CardBlock>
                    <CardBlock title="Evidence Capture (Post Submission)">
                      <div className="space-y-1.5">
                        {['Ariba submission confirmation & reference numbers', 'Screenshots of portal confirmation screens', 'cXML acknowledgement records', 'D365 billing record status update to "Submitted"'].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#00263A] text-xs mt-0.5">·</span>
                            <span className="text-xs text-slate-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardBlock>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 5: Capture Status + Evidence */}
            {currentStep === 4 && (
              <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<Eye className="w-4 h-4" />} title="Portal Response Outcomes" sub="Ariba submission results for 3 invoices" />
                    <CardBlock title="Upload Results">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800">KRL-INV-4821 · $95,000</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Ariba Ref: AR-2026-88921</p>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Submitted</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800">KRL-INV-4822 · $55,000</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">PO-4500091827 · Line 2 tolerance breach</p>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Rejected</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                          <div>
                            <span className="text-xs font-semibold text-slate-800">KRL-INV-4823 · $30,000</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Ariba Ref: AR-2026-88922</p>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Submitted</span>
                        </div>
                      </div>
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Evidence Capture & D365 Update" sub="AI records outcomes and opens exception case" kroll />
                    <CardBlock title="AI Actions Completed" accent="emerald">
                      <div className="space-y-2.5">
                        <CheckItem text="INV-4821: D365 status → Delivered · AR-2026-88921 stored" />
                        <CheckItem text="INV-4823: D365 status → Delivered · AR-2026-88922 stored" />
                        <CheckItem text="Portal screenshots captured for both successful invoices" />
                        <CheckItem text="cXML acknowledgements logged in audit trail" />
                      </div>
                    </CardBlock>
                    <CardBlock title="Exception Case Opened" accent="amber">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Invoice</span>
                          <span className="text-xs font-semibold text-slate-800">KRL-INV-4822</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Root Cause</span>
                          <span className="text-xs font-semibold text-amber-700">PO tolerance breach</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">PO Line Value</span>
                          <span className="text-xs font-semibold text-slate-800">$48,500 (5% tol. = $50,925 max)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Invoice Amount</span>
                          <span className="text-xs font-semibold text-rose-600">$55,000 — exceeds tolerance</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">D365 Case</span>
                          <span className="text-xs font-semibold text-slate-800">EXC-2026-0391 opened</span>
                        </div>
                      </div>
                    </CardBlock>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 6: Exception Handling */}
            {currentStep === 5 && (
              <motion.div key="step6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<AlertCircle className="w-4 h-4" />} title="Rejection Case — EXC-2026-0391" sub="KRL-INV-4822 rejected by Pinnacle Capital Ariba" />
                    <CardBlock title="Rejection Details" accent="amber">
                      <div className="space-y-3">
                        <div>
                          <SectionLabel>Ariba Rejection Message</SectionLabel>
                          <p className="text-xs text-slate-700 mt-1 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                            "Invoice KRL-INV-4822 rejected. Amount $55,000.00 exceeds approved PO-4500091827 Line 2 maximum of $50,925.00 (base $48,500 + 5% tolerance). Please resubmit with amended PO or revised invoice."
                          </p>
                        </div>
                        <DataTable rows={[
                          { field: 'Invoice', value: 'KRL-INV-4822 · Transaction Due Diligence Phase 2' },
                          { field: 'Root Cause', value: 'PO tolerance exceeded' },
                          { field: 'PO Authorised Max', value: '$50,925 (5% tolerance on $48,500)' },
                          { field: 'Invoice Amount', value: '$55,000 — $4,075 over limit' },
                          { field: 'Case Status', value: 'Rework — PO amendment requested' },
                        ]} />
                      </div>
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Exception Handling — AI Response" sub="Structured case routing with auditable evidence" kroll />
                    <CardBlock title="AI Actions Taken">
                      <div className="space-y-2.5">
                        <CheckItem text="Ariba rejection parsed and linked to KRL-INV-4822 in D365" />
                        <CheckItem text="Root cause classified: PO tolerance breach ($4,075 overage)" />
                        <CheckItem text="Case EXC-2026-0391 created in D365 with full evidence" />
                        <CheckItem text="PO amendment request drafted — routed to engagement partner" />
                        <CheckItem text="Pinnacle Capital AP team notified via Ariba messaging" />
                      </div>
                    </CardBlock>
                    <CardBlock title="Escalation Logic">
                      <div className="space-y-2.5">
                        <CheckItem text="Retry armed — will resubmit once PO-4500091827 Line 2 is amended" />
                        <CheckItem text="Approval gate: Michael Thornton (MD) must confirm before retry" />
                        <CheckItem warn text="If PO amendment not received within 5 business days → escalate to billing manager" />
                        <CheckItem warn text="3 failed retries → hand off to human AR specialist with structured summary" />
                      </div>
                    </CardBlock>
                    <div className="bg-[#F0F5F8] border border-[#C5D8E4] rounded-lg p-3">
                      <SectionLabel>Kroll Billing Policy</SectionLabel>
                      <p className="text-xs text-slate-600 mt-1">All retry actions are controlled and require engagement partner approval. No automated resubmission without explicit sign-off — consistent with Kroll's deterministic control framework.</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 7: Trigger Status Identified */}
            {currentStep === 6 && (
              <motion.div key="step7" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<AlertCircle className="w-4 h-4" />} title="Triggered Invoice Review" sub="1 of 3 invoices flagged for exception routing" />
                    <CardBlock title="1 Invoice Triggered Exception Handling" accent="amber">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">KRL-INV-4822 · Transaction Due Diligence</span>
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Triggered</span>
                        </div>
                        <p className="text-xs text-slate-600">Trigger: PO tolerance exceeded · $55,000 vs. max $50,925 · $4,075 overage</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[
                            { label: 'Routed To', value: 'Michael Thornton, MD' },
                            { label: 'Client Contact', value: 'Pinnacle Capital AP' },
                            { label: 'Next Action', value: 'PO amendment + retry' },
                          ].map((item) => (
                            <div key={item.label} className="border border-slate-200 bg-white rounded-lg p-2">
                              <SectionLabel>{item.label}</SectionLabel>
                              <p className="text-xs font-medium text-slate-800 mt-0.5">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardBlock>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-xs text-emerald-800">
                        <span className="font-semibold">KRL-INV-4821</span> and <span className="font-semibold">KRL-INV-4823</span> delivered successfully — no trigger detected. Proceeding to D365 posting.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="Trigger Decisioning" sub="Root cause identified · resolution path set" kroll />
                    <CardBlock title="Selected Trigger: PO Tolerance Breach">
                      <div className="space-y-2.5">
                        <CheckItem text="Ariba rejection message parsed and linked to KRL-INV-4822" />
                        <CheckItem text="Trigger rule matched: invoice amount exceeds PO line 5% tolerance" />
                        <CheckItem text="Amendment request sent to engagement partner and client AP" />
                        <CheckItem text="Controlled retry armed — awaiting PO amendment confirmation" />
                        <CheckItem text="D365 case EXC-2026-0391 updated with trigger snapshot" />
                      </div>
                    </CardBlock>
                    <CardBlock title="Trigger Snapshot">
                      <DataTable rows={[
                        { field: 'Invoice', value: 'KRL-INV-4822' },
                        { field: 'Root Cause', value: 'PO tolerance breach' },
                        { field: 'Overage', value: '$4,075' },
                        { field: 'Decision', value: 'Route for PO amendment + retry', highlight: true },
                        { field: 'Owner', value: 'Michael Thornton, MD' },
                        { field: 'Case', value: 'EXC-2026-0391' },
                      ]} />
                    </CardBlock>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 8: Post to D365 */}
            {currentStep === 7 && (
              <motion.div key="step8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-row">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-5">
                  <div className="max-w-xl mx-auto space-y-4">
                    <PanelHeader icon={<CheckCircle2 className="w-4 h-4" />} title="Final Delivery Status" sub="Matter KRL-MAT-2025-0847 · 3 invoices · $180,000" />
                    <CardBlock title="Final Invoice Status" accent="emerald">
                      <div className="space-y-2">
                        {[
                          { id: 'KRL-INV-4821', desc: 'Valuation Advisory · $95,000', status: 'Delivered', ref: 'AR-2026-88921', color: 'text-emerald-600' },
                          { id: 'KRL-INV-4822', desc: 'Due Diligence · $55,000 · after PO amendment & retry', status: 'Delivered', ref: 'AR-2026-88935', color: 'text-emerald-600' },
                          { id: 'KRL-INV-4823', desc: 'Restructuring Advisory · $30,000', status: 'Delivered', ref: 'AR-2026-88922', color: 'text-emerald-600' },
                        ].map((inv) => (
                          <div key={inv.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-semibold text-slate-800">{inv.id}</span>
                              <span className={`text-[10px] font-semibold ${inv.color}`}>{inv.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{inv.desc}</p>
                            <p className="text-[10px] text-[#00263A] font-medium mt-0.5">Ariba Ref: {inv.ref}</p>
                          </div>
                        ))}
                      </div>
                    </CardBlock>
                    <CardBlock title="D365 Work Item">
                      <DataTable rows={[
                        { field: 'Matter', value: 'KRL-MAT-2025-0847', highlight: true },
                        { field: 'Billing Status', value: 'Fully Delivered' },
                        { field: 'D365 Work Item', value: 'WI-2026-4821 — Closed' },
                        { field: 'Exception Case', value: 'EXC-2026-0391 — Resolved' },
                      ]} />
                    </CardBlock>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-5 border-l border-slate-200">
                  <div className="max-w-lg mx-auto space-y-4">
                    <PanelHeader icon={<Brain className="w-4 h-4" />} title="D365 Posting & Audit Trail" sub="AR entries created · revenue recognition triggered" kroll />
                    <CardBlock title="D365 Actions Completed" accent="emerald">
                      <div className="space-y-2.5">
                        <CheckItem text="AR ledger entries created for all 3 invoices in D365" />
                        <CheckItem text="Revenue recognition entries triggered — ASC 606 compliant" />
                        <CheckItem text="Engagement billing record KRL-MAT-2025-0847 updated: Fully Delivered" />
                        <CheckItem text="Exception case EXC-2026-0391 closed after PO amendment & retry" />
                        <CheckItem text="Engagement partner Michael Thornton notified — delivery confirmed" />
                        <CheckItem text="Pinnacle Capital AP team confirmation receipts archived" />
                      </div>
                    </CardBlock>
                    <CardBlock title="Audit Log — Complete">
                      <div className="space-y-1.5">
                        {[
                          'Ariba submission confirmations (AR-2026-88921, 88922, 88935)',
                          'Portal screenshots & cXML acknowledgements',
                          'PO amendment trail — EXC-2026-0391',
                          'Engagement partner approval timestamps',
                          'D365 AR posting journal entries',
                          'Revenue recognition schedule — ASC 606',
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Shield className="w-3 h-3 text-[#00263A] flex-shrink-0 mt-0.5" />
                            <span className="text-[10px] text-slate-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardBlock>
                    <div className="bg-[#00263A] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Award className="w-3.5 h-3.5 text-[#7AADCB]" />
                        <span className="text-[10px] font-semibold text-[#7AADCB] uppercase tracking-wider">Kroll Advisory Standard</span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed">
                        Full end-to-end invoice delivery workflow complete. Audit trail comprehensive and independent. Ready for client reporting or regulatory review.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-slate-400">
            Step {currentStep + 1} of {totalSteps} · {INVOICE_DELIVERY_STEPS[currentStep].title}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrev} disabled={currentStep === 0}
              className="flex items-center gap-2 px-5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={currentStep === totalSteps - 1 ? handleApprove : handleNext}
              disabled={currentStep === totalSteps - 1 && isApproved}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                currentStep === totalSteps - 1 && isApproved
                  ? 'bg-emerald-500 text-white cursor-default'
                  : 'bg-[#00263A] text-white hover:bg-[#003354]'
              }`}>
              {currentStep === totalSteps - 1 ? (isApproved ? 'Posted to D365' : 'Approve & Post to D365') : 'Next Step'}
              {currentStep === totalSteps - 1 && isApproved
                ? <Check className="w-3.5 h-3.5" />
                : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </motion.div>
    </>
  );
};
