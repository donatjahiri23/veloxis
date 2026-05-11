"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 pt-14 lg:pt-0 gap-3">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs lg:text-sm text-muted mt-1">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
