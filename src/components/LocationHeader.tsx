interface LocationHeaderProps {
  locationName: string;
  isLoading?: boolean;
}

export default function LocationHeader({ locationName, isLoading }: LocationHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      <svg
        className="w-4 h-4 text-glass-muted"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
      {isLoading ? (
        <span className="loading loading-dots loading-xs text-glass-primary"></span>
      ) : (
        <span className="text-body text-glass-secondary">{locationName}</span>
      )}
    </div>
  );
}
