"use client";

import { useFormStatus } from "react-dom";

export function ConfirmButton({
  message,
  children,
  className = "",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={`${className} disabled:opacity-50`}
    >
      {pending ? "…" : children}
    </button>
  );
}
