interface WeatherModuleGridProps {
  children: React.ReactNode;
  columns?: number;
}

export default function WeatherModuleGrid({
  children,
  columns = 2,
}: WeatherModuleGridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--grid-module-gap)',
      }}
    >
      {children}
    </div>
  );
}
