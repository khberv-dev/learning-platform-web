import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "success";
  size?: "md" | "sm";
};

export default function Button({ variant = "ghost", size = "md", className = "", ...props }: Props) {
  const cls = [
    "btn",
    variant === "primary" ? "btn-primary" : "",
    variant === "ghost" ? "btn-ghost" : "",
    variant === "success" ? "btn-success" : "",
    size === "sm" ? "btn-sm" : "",
    className,
  ].filter(Boolean).join(" ");

  return <button className={cls} {...props} />;
}