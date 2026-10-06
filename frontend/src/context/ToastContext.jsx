import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
        }}
      >
        {toasts.map((item) => {
          let icon = <Info size={18} color="#38bdf8" />;
          let borderColor = 'rgba(56, 189, 248, 0.4)';
          let bgGradient = 'rgba(15, 23, 42, 0.95)';

          if (item.type === 'success') {
            icon = <CheckCircle2 size={18} color="#34d399" />;
            borderColor = 'rgba(52, 211, 153, 0.4)';
          } else if (item.type === 'error') {
            icon = <AlertCircle size={18} color="#f87171" />;
            borderColor = 'rgba(248, 113, 113, 0.4)';
          } else if (item.type === 'warning') {
            icon = <AlertTriangle size={18} color="#fbbf24" />;
            borderColor = 'rgba(251, 191, 36, 0.4)';
          }

          return (
            <div
              key={item.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: `1px solid ${borderColor}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                animation: 'fadeIn 0.25s ease-out',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                fontWeight: 500,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon}
                <span>{item.message}</span>
              </div>
              <button
                onClick={() => removeToast(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
