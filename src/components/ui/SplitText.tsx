interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function SplitText({ text, className = "", delay = 0 }: SplitTextProps) {
  const words = text.split(" ");
  
  return (
    <div
      style={{ overflow: "hidden", display: "inline-flex", flexWrap: "wrap" }}
      className={`animate-fade-in ${className}`}
    >
      {words.map((word, index) => (
        <span style={{ marginRight: "0.25em" }} key={index}>
          {word}
        </span>
      ))}
    </div>
  );
}
