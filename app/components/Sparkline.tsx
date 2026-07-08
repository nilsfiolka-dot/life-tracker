interface SparklineProps {
  data: { date: string; value: number }[];
  color: string;
  min?: number;
  max?: number;
  height?: number;
}

export default function Sparkline({ data, color, min, max, height = 64 }: SparklineProps) {
  if (data.length === 0) {
    return <div style={{ height }} className="flex items-center justify-center text-xs text-slate-600">Keine Daten</div>;
  }

  const values = data.map((d) => d.value);
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const range = hi - lo || 1;
  const width = 100;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
    const y = height - ((d.value - lo) / range) * height;
    return `${x},${y}`;
  });

  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <polygon points={areaPoints} fill={color} fillOpacity={0.14} />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {points.length <= 40 &&
        points.map((p, i) => {
          const [x, y] = p.split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r={1.6} fill={color} />;
        })}
    </svg>
  );
}
