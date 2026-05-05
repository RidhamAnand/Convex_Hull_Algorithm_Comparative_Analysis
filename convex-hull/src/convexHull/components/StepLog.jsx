import { useEffect, useRef } from "react";

export function StepLog({ steps, currentStep }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [currentStep]);

  return (
    <div ref={ref} style={{
      flex: 1, overflowY: "auto", background: "#FFFFFF",
      borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", fontSize: 13,
      border: "1px solid #E5E7EB", lineHeight: 1.8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      minHeight: 0,
    }}>
      {steps.slice(0, currentStep + 1).map((s, i) => (
        <div key={i} style={{
          color: i === currentStep ? "#1F2937" : "#9CA3AF",
          borderLeft: i === currentStep ? "2px solid #6366F1" : "2px solid transparent",
          paddingLeft: 10, marginBottom: 4,
        }}>
          <span style={{ color: "#D1D5DB", marginRight: 10 }}>{String(i).padStart(3, "0")}</span>
          {s.message}
        </div>
      ))}
    </div>
  );
}
