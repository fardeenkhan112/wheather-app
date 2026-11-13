import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    cancelBtnRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E6EAF1] bg-white p-6 shadow-xl dark:border-[#1F2B3E] dark:bg-[#111827]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-[#172033] dark:text-[#F1F5F9]">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-[#697386] dark:text-[#94A3B8]">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-[#E6EAF1] bg-white px-4 py-2 text-sm font-medium text-[#172033] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#111827] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
