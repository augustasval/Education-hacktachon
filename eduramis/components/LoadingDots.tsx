interface LoadingDotsProps {
  className?: string;
}

export default function LoadingDots({ className = "" }: LoadingDotsProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
    </div>
  );
}
