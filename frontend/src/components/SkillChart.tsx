import React from 'react';

interface SkillChartProps {
  skills: Record<string, number>;
  title?: string;
}

export const SkillChart: React.FC<SkillChartProps> = ({ skills, title = 'Skill Competency Radar' }) => {
  const entries = Object.entries(skills);
  if (entries.length === 0) {
    return (
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
        No skill evaluations recorded yet.
      </div>
    );
  }

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const total = entries.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 10) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon points
  const points = entries.map(([_, val], i) => {
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(' ');

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-100">{title}</h3>
        <span className="text-[10px] text-slate-500 font-mono">Normalized (0 - 10)</span>
      </div>

      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {/* Background grid concentric circles */}
          {gridLevels.map((lvl, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * lvl}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={lvl < 1.0 ? '3 3' : 'none'}
            />
          ))}

          {/* Axis spoke lines */}
          {entries.map(([_, __], i) => {
            const { x, y } = getCoordinates(i, 10);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Skill Polygon */}
          <polygon
            points={points}
            fill="rgba(99, 102, 241, 0.25)"
            stroke="#818cf8"
            strokeWidth="2.5"
          />

          {/* Vertices & Labels */}
          {entries.map(([skill, val], i) => {
            const { x, y } = getCoordinates(i, val);
            const labelCoord = getCoordinates(i, 11.8);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] fill-slate-300 font-medium"
                >
                  {skill} ({val.toFixed(1)})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
