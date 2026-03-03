

export default function Avatar({ tone, text }: { tone: "blue" | "purple" | "green" | "red" | "yellow"; text: string }) {
  return <div className={`avatar av-${tone}`}>{text}</div>;
}