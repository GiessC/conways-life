import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-black border p-2 ${props.className ?? ""}`}
      {...props}
    >
      {props.children}
    </button>
  );
}
