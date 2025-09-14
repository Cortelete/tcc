import React, { useState } from 'react';
import { ICONS } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'teste' && password === '1234') {
      setError('');
      onLogin();
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-8 glass-card rounded-2xl shadow-2xl w-full max-w-sm border-0">
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
                <span className="text-violet-400">{ICONS.brain}</span>
                <h1 className="text-2xl font-bold text-white">NeuroSync AI</h1>
            </div>
        </div>
        <h2 className="text-xl font-semibold text-center text-white/80 mb-8">Acesse sua conta</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1">
              Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 glass-input"
              placeholder="teste"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-white/70 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 glass-input"
              placeholder="1234"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 transform hover:scale-105"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;