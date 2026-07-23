import { useEffect } from "react";
import { useAppToast } from "./appToastContext";

const ToastPop = ({
  message,
  title,
  subtitle,
  type = "success",
  onClose,
  duration = 3000,
  actionLabel,
  onAction,
}) => {
  const { showToast, hideToast } = useAppToast() || {};

  useEffect(() => {
    if (!message || !showToast) return undefined;

    showToast({
      message,
      title,
      subtitle,
      type,
      duration,
      actionLabel,
      onAction,
    });

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      if (onClose) onClose();
    };
  }, [actionLabel, duration, message, onAction, onClose, showToast, subtitle, title, type]);

  useEffect(() => {
    if (!message) hideToast?.();
  }, [hideToast, message]);

  return null;
};

export default ToastPop;
