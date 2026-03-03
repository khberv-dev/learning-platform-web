

export default function Tag({ kind, children }: { kind: "active" | "inactive" | "pending" | "blue" | "purple" | "draft"; children: React.ReactNode }) {
  return <span className={`tag tag-${kind}`}>{children}</span>;
}