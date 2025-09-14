import React from 'react';

interface WorldMapProps {
  progress: number;
}

const MAP_NODES = [
  { name: 'Vila Inicial', x: '10%', y: '80%' },
  { name: 'Floresta dos Hábitos', x: '25%', y: '60%' },
  { name: 'Picos da Concentração', x: '45%', y: '75%' },
  { name: 'Rio da Memória', x: '65%', y: '55%' },
  { name: 'Campos da Serenidade', x: '80%', y: '40%' },
  { name: 'Cidadela da Maestria', x: '90%', y: '20%' },
];

const WorldMap: React.FC<WorldMapProps> = ({ progress }) => {
  const unlockedNodes = Math.min(progress, MAP_NODES.length - 1);

  return (
    <div className="relative w-full h-40 sm:h-48 bg-black/20 rounded-xl p-2">
      <svg width="100%" height="100%" viewBox="0 0 400 150">
        {/* Path Background */}
        <path
          d="M 40 120 C 100 80, 140 130, 220 100 S 300 40, 360 30"
          stroke="#000000"
          strokeOpacity="0.3"
          strokeWidth="6"
          fill="none"
          strokeDasharray="8 4"
          strokeLinecap="round"
        />
        {/* Path Progress */}
        {unlockedNodes > 0 && (
             <path
              d="M 40 120 C 100 80, 140 130, 220 100 S 300 40, 360 30"
              stroke="url(#path-gradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: 500,
                strokeDashoffset: 500 - (500 * (unlockedNodes / (MAP_NODES.length-1))),
                transition: 'stroke-dashoffset 1.5s ease-in-out',
              }}
            />
        )}
       
        <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#38bdf8', stopOpacity: 1}} />
            </linearGradient>
        </defs>

      </svg>
      <div className="absolute inset-0">
        {MAP_NODES.map((node, index) => {
          const isUnlocked = index <= unlockedNodes;
          const isCurrent = index === unlockedNodes;
          return (
            <div
              key={node.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.x, top: node.y }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-1000
                  ${isUnlocked ? 'bg-violet-500' : 'bg-gray-600'}
                  ${isCurrent ? 'ring-4 ring-offset-2 ring-offset-slate-800 ring-cyan-400' : ''}
                `}
              >
                {isUnlocked && <span className="text-xs font-bold">{index+1}</span>}
              </div>
              <span
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-semibold whitespace-nowrap transition-opacity duration-1000 ${isUnlocked ? 'opacity-100 text-white' : 'opacity-50'}`}
              >
                {node.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;