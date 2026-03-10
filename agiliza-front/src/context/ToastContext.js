'use client'
import {createContext, useContext, useState, useCallback} from 'react';
import styles from './toast.module.css';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    //-- FUNÇÃO PARA REMOVER O TOAST DEPOIS DE UM TEMPO --
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // -- FUNÇÃO PRINCIPLA PARA AVISAR O LOJISTA --
    const notify = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, {id, message, type}]);

        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={notify}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((t) => (
                    <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
                        <span className={styles.icon}>
                            {t.type === 'success' ? '✅' : t.type === 'error' ? '🚫' : '⚠️'}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useNotify = () => useContext(ToastContext);