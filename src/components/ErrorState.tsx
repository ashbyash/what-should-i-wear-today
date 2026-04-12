interface ErrorStateProps {
  message: string;
  description?: string;
  emoji?: string;
}

export default function ErrorState({
  message,
  description = '잠시 후 다시 시도해주세요.',
  emoji = '🌧️',
}: ErrorStateProps) {
  return (
    <div className="text-center px-4">
      <div className="text-4xl mb-4">{emoji}</div>
      <p className="text-skin-primary font-medium">{message}</p>
      <p className="mt-2 text-skin-muted text-body font-light">{description}</p>
    </div>
  );
}
