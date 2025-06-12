import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/tables');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const success = await login(username, password);
      
      if (success) {
        navigate('/tables');
      }
    } catch (err) {
      setError('Falha ao fazer login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1C1C1E] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#2C2C2E] rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center text-center">
          <Layers className="w-20 h-20 text-[#D4AF37]" />
          <h1 className="mt-4 text-3xl font-extrabold text-white">Bar do Lê</h1>
          <p className="mt-2 text-[#A0A0A0]">Login</p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-[#FF3B30] bg-[#FF3B30]/20 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#A0A0A0]">
              Usuário
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#A0A0A0]">
                <User className="w-5 h-5" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-white bg-[#1C1C1E] border border-[#A0A0A0]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Digite seu usuário"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#A0A0A0]">
              Senha
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#A0A0A0]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 text-white bg-[#1C1C1E] border border-[#A0A0A0]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 text-[#1C1C1E] bg-[#D4AF37] rounded-md hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;