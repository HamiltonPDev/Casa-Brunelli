"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface AdminFieldProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "textarea";
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  icon?: ReactNode;
  options?: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const BASE_INPUT =
  "w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 " +
  "focus:outline-none focus:ring-2 focus:ring-admin-sage/20 focus:border-admin-sage " +
  "disabled:bg-gray-50 disabled:cursor-not-allowed";

export function AdminField({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  options,
  disabled = false,
  required = false,
  className,
}: AdminFieldProps) {
  const borderStyle = error
    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
    : "border-gray-300";

  const paddingLeft = icon ? "pl-10" : "";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {type === "select" && options ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(BASE_INPUT, borderStyle, paddingLeft)}
          >
            <option value="">{placeholder ?? "Select…"}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={cn(BASE_INPUT, borderStyle, "resize-none")}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(BASE_INPUT, borderStyle, paddingLeft)}
          />
        )}
      </div>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
