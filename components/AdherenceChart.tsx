import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TaskLog, AdherenceStatus } from '../types';

interface TaskChartProps {
  history: TaskLog[];
}

const TaskChart: React.FC<TaskChartProps> = ({ history }) => {
  const processData = () => {
    const dataByDay: { [key: string]: { name: string; completas: number; perdidas: number } } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0];
      dataByDay[dateString] = { name: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3), completas: 0, perdidas: 0 };
    }

    history.forEach(log => {
      const scheduledTime = typeof log.scheduledTime === 'string' ? new Date(log.scheduledTime) : log.scheduledTime;
      const dateString = scheduledTime.toISOString().split('T')[0];
      
      if (dataByDay[dateString]) {
        if (log.status === AdherenceStatus.TAKEN) {
          dataByDay[dateString].completas++;
        } else if (log.status === AdherenceStatus.MISSED) {
          dataByDay[dateString].perdidas++;
        }
      }
    });

    return Object.values(dataByDay);
  };

  const chartData = processData();

  return (
    <div className="glass-card p-4 rounded-2xl h-72">
        <h3 className="text-lg font-bold text-white/90 mb-4 px-2">Progresso na Última Semana</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255, 255, 255, 0.8)' }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgba(255, 255, 255, 0.8)' }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} />
                <Tooltip
                    cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                    contentStyle={{ 
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)', 
                        borderRadius: '0.75rem',
                        color: '#fff'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{paddingTop: '10px'}} iconSize={12} formatter={(value) => <span style={{color: 'rgba(255, 255, 255, 0.9)'}}>{value}</span>} />
                <Bar dataKey="completas" fill="#22C55E" name="Completas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perdidas" fill="#F43F5E" name="Perdidas" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TaskChart;