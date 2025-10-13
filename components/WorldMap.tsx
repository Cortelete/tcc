import React from 'react';
import { MAP_NODES } from '../constants';

interface WorldMapProps {
  progress: number;
}

const WorldMap: React.FC<WorldMapProps> = ({ progress }) => {
  const currentNodeIndex = Math.min(progress - 1, MAP_NODES.length - 1);

  const parseCoords = (node: { x: string; y: string }) => {
    return {
      x: parseFloat(node.x.replace('%', '')),
      y: parseFloat(node.y.replace('%', '')),
    };
  };

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-xl journey-map-bg overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Render paths between nodes */}
        {MAP_NODES.slice(0, -1).map((node, index) => {
          const start = parseCoords(node);
          const end = parseCoords(MAP_NODES[index + 1]);
          const isUnlocked = index < currentNodeIndex;

          return (
            <line
              key={`path-${index}`}
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              className={`map-path ${isUnlocked ? 'map-path--unlocked' : ''}`}
            />
          );
        })}

        {/* Render nodes */}
        {MAP_NODES.map((node, index) => {
          const { x, y } = parseCoords(node);
          const isUnlocked = index <= currentNodeIndex;
          const isCurrent = index === currentNodeIndex;
          
          let statusClass = 'map-node--locked';
          if (isCurrent) {
            statusClass = 'map-node--current';
          } else if (isUnlocked) {
            statusClass = 'map-node--unlocked';
          }
          
          return (
            <g
              key={node.name}
              transform={`translate(${x} ${y})`}
              className={`map-node ${statusClass}`}
            >
              <circle className="map-node-orb" />
              <text
                className="map-node-label"
                textAnchor="middle"
                y="12"
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WorldMap;
