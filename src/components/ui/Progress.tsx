

export default function Progress({ value, width = 80, color }: { value: number; width?: number; color?: "red" }) {
  const fillStyle: React.CSSProperties = { width: `${Math.max(0, Math.min(100, value))}%` };
  if (color === "red") fillStyle.background = "var(--red)";

  return (
    <div className="pbar">
      <div className="pbar-track" style={{ width }}>
        <div className="pbar-fill" style={fillStyle} />
      </div>
      <span className="tm">{value}%</span>
    </div>
  );
}