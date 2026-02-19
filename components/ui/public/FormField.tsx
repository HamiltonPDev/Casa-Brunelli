// components/ui/public/FormField.tsx
// Atom — public-facing form field (label + input/select/textarea + error)
// Themed for the Tuscan design system. Admin uses AdminField.tsx instead.

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldBaseProps {
  /** Input id — also used as htmlFor on the label */
  id: string;
  /** Label text — omit for unlabelled fields */
  label?: string;
  /** Show red asterisk after label */
  required?: boolean;
  /** Show "(optional)" tag after label */
  optional?: boolean;
  /** Validation error message — shows red below field */
  error?: string;
  /** Helper text — shown below field when no error */
  hint?: string;
  /** Extra wrapper className */
  className?: string;
}

interface FormFieldInput extends FormFieldBaseProps {
  type?: "text" | "email" | "tel" | "password" | "number" | "date";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  /** Render a ReactNode icon inside the input (left-aligned) */
  icon?: ReactNode;
}

interface FormFieldSelect extends FormFieldBaseProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: readonly SelectOption[];
  icon?: ReactNode;
}

interface FormFieldTextarea extends FormFieldBaseProps {
  type: "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type FormFieldProps = FormFieldInput | FormFieldSelect | FormFieldTextarea;

// ─── Styles ────────────────────────────────────────────────────

const BASE_INPUT =
  "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-opacity-30";

function getFieldStyle(
  hasError: boolean,
  isEmpty?: boolean
): React.CSSProperties {
  return {
    backgroundColor: "white",
    borderColor: hasError ? "#C62828" : "rgba(139,157,131,0.3)",
    color: isEmpty ? "#3D524380" : "#2D3A2E",
  };
}

// ─── Component ─────────────────────────────────────────────────

export function FormField(props: Readonly<FormFieldProps>) {
  const { id, label, required, optional, error, hint, className } = props;

  const hasError = !!error;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#2D3A2E" }}
        >
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: "#C62828" }}>
              {" "}
              *
            </span>
          )}
          {optional && (
            <span
              className="ml-1 text-xs font-normal"
              style={{ color: "#3D524399" }}
            >
              (optional)
            </span>
          )}
        </label>
      )}

      {/* Field */}
      {props.type === "textarea" ? (
        <textarea
          id={id}
          rows={props.rows ?? 4}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className={cn(
            BASE_INPUT,
            "resize-none",
            hasError && "border-red-400"
          )}
          style={getFieldStyle(hasError)}
        />
      ) : props.type === "select" ? (
        <div className="relative">
          {props.icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {props.icon}
            </div>
          )}
          <select
            id={id}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className={cn(
              BASE_INPUT,
              "appearance-none cursor-pointer",
              props.icon && "pl-10",
              hasError && "border-red-400"
            )}
            style={getFieldStyle(hasError, !props.value)}
          >
            <option value="" disabled>
              {props.placeholder ?? "Select…"}
            </option>
            {props.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="relative">
          {props.icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {props.icon}
            </div>
          )}
          <input
            id={id}
            type={props.type ?? "text"}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            autoComplete={props.autoComplete}
            required={required}
            className={cn(
              BASE_INPUT,
              props.icon && "pl-10",
              hasError && "border-red-400"
            )}
            style={getFieldStyle(hasError)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          className="mt-1 text-xs flex items-center gap-1"
          style={{ color: "#C62828" }}
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Hint (only when no error) */}
      {!error && hint && (
        <p className="mt-1 text-xs" style={{ color: "#3D524380" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
