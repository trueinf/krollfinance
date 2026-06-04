import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  FileText,
  Upload,
  Building2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INVOICE_DELIVERY_STEPS = [
  { id: 1, title: 'Invoice Approved in ERP', details: ['ERP approval triggers delivery agent selection'] },
  { id: 2, title: 'Check Customer Portal Requirement', details: ['Verify portal access & onboarding'] },
  { id: 3, title: 'Validate Invoice Data', details: ['Schema + business rules before submission'] },
  { id: 4, title: 'Submit to Customer Portal', details: ['Upload + submit invoice'] },
  { id: 5, title: 'Capture Status + Evidence', details: ['Update outcomes and store audit evidence'] },
  { id: 6, title: 'Exception Handling', details: ['Rejections, rework, and controlled retries'] },
  { id: 7, title: 'Trigger Identified', details: ['Highlight invoices that triggered exception handling'] },
  { id: 8, title: 'Update Status + Logs', details: ['Finalize D365 status and audit trail'] },
];

export const InvoiceDeliveryView: React.FC<{ onPostedToD365?: () => void }> = ({ onPostedToD365 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [showApprovedPopup, setShowApprovedPopup] = useState(false);
  const totalSteps = INVOICE_DELIVERY_STEPS.length;

  const handleNext = () => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const handleApprove = () => {
    setIsApproved(true);
    setShowApprovedPopup(true);
  };

  const handlePopupOk = () => {
    setShowApprovedPopup(false);
    onPostedToD365?.();
  };

  const steps = INVOICE_DELIVERY_STEPS;
  const activeStep = steps[currentStep];

  return (
    <>
      {showApprovedPopup &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50"
            style={{ zIndex: 2147483647 }}
            onClick={() => setShowApprovedPopup(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 id="popup-title" className="text-xl font-bold text-slate-800 mb-2">
                Posted to D365
              </h2>
              <button
                onClick={handlePopupOk}
                className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>,
          document.getElementById('portal-root') || document.body
        )}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50"
    >
      {/* Step Stepper */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 min-w-0 max-w-[5rem]">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white ring-2 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span
                    className={`text-[9px] font-semibold text-center uppercase tracking-wide leading-tight w-full px-0.5 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-0.5 min-w-2 mt-[-18px]">
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
          {/* Step 1: Smart Intake */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              {/* Left: Source / Ingestion */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Invoice Delivery Request</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-900">Treasury Operations</span>
                          <div className="text-sm text-slate-600 mt-1">ERP approval received · ready for portal delivery</div>
                          <div className="text-xs text-slate-400 mt-1">Mar 18, 9:15 AM · Trigger: delivery agent</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { field: 'Account', value: 'MetroTech Supplies (Portal-enabled)' },
                        { field: 'Invoice #', value: 'INV-8821, INV-8822, INV-8823' },
                        { field: 'Upload Method', value: 'Portal' },
                        { field: 'Due Date', value: 'Mar 25, 2026' },
                        { field: 'Requestor', value: 'AR Team' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.field}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Right: AI Validation Results */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Trigger Fires</h2>
                      <p className="text-sm text-slate-500">Invoice selected for portal delivery</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Validation Results</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">ERP approval captured</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Delivery trigger initiated</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Invoice queued for portal submission</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      AI System Message
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      ERP approval received; trigger fired and invoice selection is ready for portal checks.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Portal Onboarding & Access Validation */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <UserCheck className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Portal Access Request</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Portal Status</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { field: 'Account', value: 'MetroTech Supplies' },
                        { field: 'Portal', value: 'MetroTech Supplier Portal' },
                        { field: 'Access Request', value: 'Upload invoice INV-8821, INV-8822, INV-8823' },
                        { field: 'Onboarding Date', value: 'Jan 15, 2026' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500">{row.field}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Check Customer Portal Requirement</h2>
                      <p className="text-sm text-slate-500">Verify portal access & requirements</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Validation Results</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Account already onboarded to portal</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Credentials valid</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">If Portal Access Not Available</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>AI initiates onboarding workflow</li>
                      <li>Drafts account outreach email for portal access</li>
                      <li>Tracks onboarding confirmation</li>
                      <li>Updates D365 & notifies requestor on confirmation</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Invoice Readiness & Pre Upload Validation */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <ClipboardCheck className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Invoices for Upload</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Invoice Pack</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { field: 'INV-8821', value: 'Ready' },
                        { field: 'INV-8822', value: 'Ready' },
                        { field: 'INV-8823', value: 'Ready' },
                        { field: 'Account', value: 'MetroTech Supplies' },
                        { field: 'PO Required', value: 'Yes (INV-8822)' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{row.field}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Validate Invoice Data</h2>
                      <p className="text-sm text-slate-500">Validate schema + business rules before submission</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Validation Results</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { check: 'Invoice completeness', status: 'Pass' },
                        { check: 'PO presence (if required)', status: 'Pass' },
                        { check: 'Correct account entity', status: 'Pass' },
                        { check: 'Portal formatting rules', status: 'Pass' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{row.check}</span>
                          <span className="text-sm font-semibold text-emerald-600">{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    If issues detected: AI enriches missing master data (where allowed) OR opens a pre-emptive correction task.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: AI Driven Portal Invoice Upload */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Upload className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Invoices to Upload</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upload Queue</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { field: 'INV-8821', value: 'Queued' },
                        { field: 'INV-8822', value: 'Queued' },
                        { field: 'INV-8823', value: 'Queued' },
                        { field: 'Target Portal', value: 'MetroTech Supplier Portal' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{row.field}</span>
                          <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Submit to Customer Portal</h2>
                      <p className="text-sm text-slate-500">AI submits invoice(s) to the customer portal</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Progress</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                        <span className="text-sm text-slate-700">Confirm portal upload path</span>
                      </div>
                      <div className="space-y-2 pl-8">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600" /> Login
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600" /> Navigation
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> Invoice upload
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Capture:</span>
                        <ul className="text-sm text-slate-700 mt-1 space-y-0.5">
                          <li>• Submission confirmation</li>
                          <li>• Screenshots/logs for audit</li>
                          <li>• Status updated in D365</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 5: Upload Monitoring & Failure Detection */}
          {currentStep === 4 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Eye className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Portal Response Outcomes</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upload Results</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="text-sm font-medium text-emerald-800">INV-8821</span>
                        <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">Uploaded</span>
                      </div>
                      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-sm font-medium text-amber-800">INV-8822</span>
                        <span className="text-xs font-bold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100">PO Mismatch</span>
                      </div>
                      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-red-50 border border-red-200">
                        <span className="text-sm font-medium text-red-800">INV-8823</span>
                        <span className="text-xs font-bold text-red-700 px-2 py-0.5 rounded-full bg-red-100">Format Error</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Capture Submission Status + Evidence</h2>
                      <p className="text-sm text-slate-500">Record outcomes, evidence, and update status in D365</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Actions</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <p className="text-sm text-slate-700">
                        For successes and failures: AI captures portal confirmation or rejection details, stores evidence for audit, and updates D365 status. If rejected, it also creates a structured rework case.
                      </p>
                      {[
                        { case: 'INV-8822', cause: 'PO mismatch', classification: 'PO issue' },
                        { case: 'INV-8823', cause: 'Invalid format', classification: 'Format error' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                          <span className="text-slate-700">{row.case}: {row.cause}</span>
                          <span className="font-semibold text-slate-900">{row.classification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 6: Rejection Resolution & Invoice Rework */}
          {currentStep === 5 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Rejection Cases</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upload Failures</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        {
                          invoice: 'INV-8822',
                          issue: 'PO mismatch – portal rejects: "Invalid / mismatched PO number"',
                          status: 'Rework in progress (PO correction ticket opened)',
                        },
                        {
                          invoice: 'INV-8823',
                          issue: 'Format error – encrypted PDF rejected by portal',
                          status: 'Rework in progress (format fix attempts ongoing)',
                        },
                      ].map((row, i) => (
                        <div key={i} className="py-3 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-slate-800">{row.invoice}</span>
                            <span className="text-amber-600 font-medium text-right max-w-[10rem]">
                              {row.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{row.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Exception Handling (Portal Rejections)</h2>
                      <p className="text-sm text-slate-500">
                        AI converts portal rejections into structured cases, routes work, and controls retries with auditable evidence.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Trigger, Root Cause & Collaboration
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-slate-700">
                        The moment the portal rejects an invoice or upload fails, AI:
                      </p>
                      <ul className="text-sm text-slate-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          Reads the portal rejection / notification and auto-creates a Rejection Case in D365
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          Classifies root cause (PO mismatch, missing PO, invalid format, incorrect customer, duplicate, portal rule)
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          Opens a task for the right team with invoice, customer, rejection reason, and evidence
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          Ensures required approvals are captured before any automated retry
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          Repeated failures or mixed errors → escalated to Treasury FTE with a structured summary
                        </li>
                      </ul>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                            Example: PO Rejection (INV-8822)
                          </p>
                          <p className="text-xs text-slate-600">
                            Portal message: &quot;PO 4500123456 does not match active purchase order.&quot;
                          </p>
                          <p className="text-xs text-slate-700 mt-2">
                            Root cause identified: <span className="font-semibold">PO mismatch</span>. Ticket raised for PO update, then AI will
                            re-upload once correction is approved.
                          </p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                            Example: Format Error (INV-8823)
                          </p>
                          <p className="text-xs text-slate-600">
                            Portal message: &quot;Rejected: PDF is password protected / encrypted. Please upload an unprotected PDF.&quot;
                          </p>
                          <p className="text-xs text-slate-700 mt-2">
                            AI creates a rework case to recreate an unprotected PDF and will attempt controlled retries. If unsuccessful after
                            multiple attempts, the case is handed to a human agent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 7: Trigger Identified */}
          {currentStep === 6 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Triggered Invoice Review</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">1 Invoice Triggered Exception Handling</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-800">Invoice</span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Triggered</span>
                        </div>
                        <p className="mt-1 text-base font-bold text-slate-900">INV-8822</p>
                        <p className="mt-2 text-sm text-slate-700">
                          Trigger detected: <span className="font-semibold">PO mismatch</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Portal message: "PO 4500123456 does not match active purchase order."
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-md border border-slate-200 bg-white p-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Routed to</p>
                            <p className="text-sm font-medium text-slate-800">Procurement / AP team</p>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-white p-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Action</p>
                            <p className="text-sm font-medium text-slate-800">PO correction requested</p>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-white p-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next Automation</p>
                            <p className="text-sm font-medium text-slate-800">Retry upload after approval</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        Other invoices continue through normal flow if no trigger is detected.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Trigger Decisioning</h2>
                      <p className="text-sm text-slate-500">Explain why this invoice is routed for exception handling</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Selected Trigger: PO Mismatch</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">Portal rejection parsed and linked to INV-8822</span>
                      </div>
                      <div className="space-y-2 pl-8 text-sm text-slate-700">
                        <p>• Trigger rule matched: PO mismatch against active PO on portal</p>
                        <p>• Human/team handoff created with invoice, customer, and rejection evidence</p>
                        <p>• Retry is controlled and runs only after approval/correction</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Trigger Snapshot:</span>
                        <ul className="text-sm text-slate-700 mt-1 space-y-0.5">
                          <li>• Invoice: INV-8822</li>
                          <li>• Root cause: PO mismatch</li>
                          <li>• Decision: route for correction + retry</li>
                          <li>• Owner: Procurement/AP</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 8: Completion, Notification & Audit */}
          {currentStep === 7 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-row"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 border-r border-slate-200 bg-white overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Source Document</h2>
                        <p className="text-sm text-slate-500">Completed Work Items</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Final Status (3 Invoices)</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { item: 'INV-8821', status: 'Delivered' },
                        { item: 'INV-8822', status: 'Delivered (after PO rework & retry)' },
                        {
                          item: 'INV-8823',
                          status: 'Escalated – format reupload unsuccessful after multiple AI retries',
                        },
                        { item: 'D365 Work Item', status: 'Closed / Escalated as applicable' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{row.item}</span>
                          <span className="text-sm font-semibold text-emerald-600">{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-slate-50/50 overflow-y-auto p-6 border-l border-slate-200">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Update Status + Logs</h2>
                      <p className="text-sm text-slate-500">D365 updates and audit trail</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Actions Completed</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">AI confirms final upload success</span>
                      </div>
                      <div className="space-y-2 pl-8 text-sm text-slate-700">
                        <p>• D365 work item → Closed or Escalated to Treasury</p>
                        <p>• Case → Resolved for delivered invoices; escalated for persistent format failures</p>
                        <p>• Auto notifies requestor</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Audit Log:</span>
                        <ul className="text-sm text-slate-700 mt-1 space-y-0.5">
                          <li>• Evidence</li>
                          <li>• Upload timestamps</li>
                          <li>• Failure reasons</li>
                          <li>• Actions taken</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-slate-200 p-6 flex justify-center gap-4 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-3 px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl text-base font-bold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={currentStep === totalSteps - 1 ? handleApprove : handleNext}
          disabled={currentStep === totalSteps - 1 && isApproved}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-base font-bold transition-colors active:scale-95 transform duration-200 ${
            currentStep === totalSteps - 1 && isApproved
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {currentStep === totalSteps - 1 ? (isApproved ? 'Approved' : 'Approve') : 'Next Step'}
          {currentStep === totalSteps - 1 && isApproved ? (
            <Check className="w-5 h-5" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
    </>
  );
};
