"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, change, prefix = "", suffix = "", icon }: MetricCardProps) {
  const formatted = typeof value === "number"
    ? prefix + value.toLocaleString() + suffix
    : prefix + value + suffix;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted font-medium">{label}</span>
        {icon && <div className="text-muted group-hover:text-accent-light transition-colors">{icon}</div>}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-text-primary font-mono tracking-tight">{formatted}</span>
        {change !== undefined && (
          <span className={`text-sm font-medium flex items-center gap-0.5 mb-0.5 ${change >= 0 ? "text-success" : "text-danger"}`}>
            {change >= 0 ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
              </svg>
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
