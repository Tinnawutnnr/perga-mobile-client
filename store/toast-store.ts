import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastState {
  current: ToastItem | null;
  show: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: () => void;
}

let autoTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  current: null,

  show: (message, type = "info", duration = 3400) => {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set({ current: { id, type, message, duration } });
    autoTimer = setTimeout(() => {
      set({ current: null });
      autoTimer = null;
    }, duration);
  },

  dismiss: () => {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
    set({ current: null });
  },
}));

// ─── Imperative helpers — safe to call outside React ─────────────────────────
// Use these in Zustand store actions, async functions, etc.

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "success", duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "error", duration ?? 4200),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "warning", duration ?? 3800),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "info", duration),
};
