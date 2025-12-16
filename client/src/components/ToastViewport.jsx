import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext.jsx';

export default function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toastViewport" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast-${t.variant}`}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={() => dismiss(t.id)}
            role="button"
            tabIndex={0}
          >
            <div className="toastTop">
              <div className="toastTitle">{t.title}</div>
              <div className="toastHint">Tap to dismiss</div>
            </div>
            {t.message ? <div className="toastMsg">{t.message}</div> : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
