import type { ReactNode } from "react";

export default function CollegePortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0d1220 0%, #111827 42%, #141d38 100%)",
        minHeight: "100vh",
        color: "#e8e4dc",
      }}
    >
      {children}
    </div>
  );
}
