import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, X, AlertTriangle, Info } from "../../constants/icons";
import { toastVariants } from "../../core/animation/animations";

const Toast = ({ visible, message, type = "success", duration = 3000, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#22C55E",
          borderColor: "#22C55E",
          icon: <BadgeCheck size={18} color="#FFFFFF" />,
          iconBg: "#16A34A",
        };
      case "error":
        return {
          backgroundColor: "#EF4444",
          borderColor: "#EF4444",
          icon: <X size={18} color="#FFFFFF" />,
          iconBg: "#B91C1C",
        };
      case "warning":
        return {
          backgroundColor: "#F59E0B",
          borderColor: "#F59E0B",
          icon: <AlertTriangle size={18} color="#FFFFFF" />,
          iconBg: "#B45309",
        };
      case "info":
        return {
          backgroundColor: "#3B82F6",
          borderColor: "#3B82F6",
          icon: <Info size={18} color="#FFFFFF" />,
          iconBg: "#1D4ED8",
        };
      default:
        return {
          backgroundColor: "#22C55E",
          borderColor: "#22C55E",
          icon: <BadgeCheck size={18} color="#FFFFFF" />,
          iconBg: "#16A34A",
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "2rem",
        zIndex: 9999,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={toastVariants.initial}
            animate={toastVariants.animate}
            exit={toastVariants.exit}
            transition={toastVariants.transition}
            style={{
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              borderWidth: 0,
              borderRadius: "22px",
              minHeight: "44px",
              padding: "8px 14px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "12px",
              boxShadow: `0 6px 20px rgba(0, 0, 0, 0.18), 0 0 0 1px ${config.borderColor}`,
              maxWidth: "90%",
              width: "auto",
            }}
            className="toast-container"
          >
            {/* Icon Container */}
            <div
              style={{
                backgroundColor: config.iconBg,
                padding: "7px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {config.icon}
            </div>

            {/* Message Container */}
            <div style={{ flex: 1, paddingRight: "4px" }}>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "17px",
                  color: "#fff",
                  margin: 0,
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.18)",
                  wordBreak: "break-word",
                }}
              >
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (min-width: 640px) {
          .toast-container {
            max-width: 400px !important;
          }
        }

        @media (min-width: 768px) {
          .toast-container {
            max-width: 450px !important;
          }
        }

        @media (min-width: 1024px) {
          .toast-container {
            max-width: 500px !important;
          }
        }

        @media (max-width: 639px) {
          .toast-container {
            max-width: 85% !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;