import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
  onStartRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onStartRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      if (username === 'teste' && password === '123') {
        onLoginSuccess();
      } else {
        setError('Usuário ou senha inválidos.');
        setIsLoading(false);
      }
    }, 500);
  };
  
  const handleCoinClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  }

  return (
    <div className="main-background flex items-center justify-center min-h-screen p-4">
      <div className="p-8 glass-card rounded-2xl shadow-2xl w-full max-w-sm border-0 relative overflow-hidden">
        <img 
            src="/mascot.png" 
            alt="Mascote Sync de Fundo" 
            className="absolute top-1/2 left-1/2 w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 opacity-10 transform -rotate-12 pointer-events-none"
        />
        <div className="relative z-10">
            <div className="flex flex-col items-center justify-center mb-6">
                <img 
                  src="/moeda.png" 
                  alt="Moeda da Sorte" 
                  className={`w-20 h-20 mb-4 cursor-pointer coin ${isSpinning ? 'spinning' : ''}`}
                  onClick={handleCoinClick}
                />
                <img src="/logo.png" alt="NeuroSync Logo" className="h-14"/>
            </div>
            <h2 className="text-xl font-semibold text-center text-white/80 mb-8">Acesse sua conta</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1">
                  Usuário (teste)
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 glass-input"
                  placeholder="Digite 'teste'"
                  required
                />
              </div>
              <div>
                <label htmlFor="password"  className="block text-sm font-medium text-white/70 mb-1">
                  Senha (123)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 glass-input"
                  placeholder="Digite '123'"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 transform hover:scale-105 disabled:bg-violet-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <div className="text-center mt-6">
                <p className="text-sm text-white/60">
                    Não tem uma conta?{' '}
                    <button
                        type="button"
                        onClick={onStartRegister}
                        className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Crie uma agora
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;