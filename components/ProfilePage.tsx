import React from 'react';
import { User, CharacterPower } from '../types';
import { ICONS, ACHIEVEMENTS } from '../constants';
import WorldMap from './WorldMap';

interface ProfilePageProps {
  user: User;
}

const PowerDisplay: React.FC<{power: CharacterPower | null}> = ({power}) => {
    if(!power) return null;
    
    const powerInfo = {
        focus: { icon: ICONS.power_focus, name: "Poder do Foco", color: "text-amber-300", description: "Mente afiada e concentrada para superar desafios." },
        memory: { icon: ICONS.power_memory, name: "Poder da Memória", color: "text-sky-300", description: "Lembranças claras para nunca perder o caminho." },
        calm: { icon: ICONS.power_calm, name: "Poder da Calma", color: "text-emerald-300", description: "Serenidade interior para enfrentar qualquer tempestade." },
    }

    const current = powerInfo[power];

    return (
        <div className="w-full mt-6 text-center">
            <div className={`inline-flex items-center gap-2 ${current.color}`}>
                {current.icon}
                <h3 className="text-xl font-bold">{current.name}</h3>
            </div>
            <p className="text-white/70 mt-1">{current.description}</p>
        </div>
    )
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const level = Math.floor(user.xp / 100);
  const xpForNextLevel = 100;
  const currentLevelXp = user.xp % xpForNextLevel;
  const progressPercentage = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6 text-white pb-20">
      <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl font-bold">{user.name.charAt(0)}</span>
        </div>
        <h2 className="text-3xl font-bold">{user.name}</h2>
        <PowerDisplay power={user.characterPower} />
        
        <div className="w-full mt-6">
            <div className="flex justify-between items-end mb-1">
                <span className="text-lg font-bold text-fuchsia-300">Nível {level}</span>
                <span className="text-sm font-medium text-white/70">{user.xp} / {(level + 1) * 100} XP</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-4">
                <div 
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%`}}
                ></div>
            </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white/90 mb-4">Mapa da Jornada</h3>
        <WorldMap progress={user.mapProgress} />
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
            {ICONS.trophy} Conquistas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = user.achievements.includes(achievement.id);
                return (
                    <div key={achievement.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isUnlocked ? 'bg-green-500/20' : 'bg-black/20 opacity-60'}`}>
                        <div className={`transition-colors ${isUnlocked ? 'text-green-300' : 'text-white/40'}`}>
                           {achievement.icon}
                        </div>
                        <div>
                            <p className={`font-bold ${isUnlocked ? 'text-white/90' : 'text-white/60'}`}>{achievement.name}</p>
                            <p className="text-sm text-white/60">{achievement.description}</p>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;