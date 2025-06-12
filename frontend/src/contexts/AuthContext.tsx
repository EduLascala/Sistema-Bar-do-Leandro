import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

// Types
interface User {
  username: string;
  // Adicione outros campos do usuário que você pode receber do backend, como id
  id: string; // O backend agora retorna o id do usuário (Long, mas como string no JSON)
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void; // Manter para verificar o estado de autenticação ao carregar
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Adicionar estado de carregamento inicial

  // checkAuth agora apenas restaura o estado se houver um token válido (simplificado para username)
  // Em uma aplicação real, aqui você validaria um token JWT com o backend.
  const checkAuth = useCallback(() => {
    // Por enquanto, vamos manter a "lembrança" do usuário como o username salvo no localStorage.
    // Em produção, isso seria substituído por validação de token JWT.
    const savedUser = localStorage.getItem('bar_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('bar_user'); // Limpa dados corrompidos
      }
    }
    setLoading(false); // Finaliza o carregamento inicial
  }, []);

  // Chama checkAuth ao montar o componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function - agora faz requisição HTTP para o backend
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user: User = await response.json();
        setCurrentUser(user);
        // Em uma aplicação real, você salvaria o token JWT aqui
        // Para simplificar, ainda salvaremos o username para "lembrar" o login
        localStorage.setItem('bar_user', JSON.stringify({ username: user.username, id: user.id }));
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        const errorData = await response.text(); // Pega a mensagem de erro do corpo da resposta
        toast.error(`Falha no login: ${errorData || response.statusText}`);
        return false;
      }
    } catch (err) {
      console.error('Erro de rede ou servidor:', err);
      toast.error('Erro ao conectar ao servidor. Verifique sua conexão.');
      return false;
    }
  };

  // Logout function - agora também limpa o localStorage
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bar_user'); // Limpa dados do localStorage
    toast.info('Logout realizado com sucesso');
  };

  const value = {
    currentUser,
    login,
    logout,
    checkAuth
  };

  // Renderiza os children apenas após a verificação de autenticação inicial
  if (loading) {
    return <div>Carregando autenticação...</div>; // Ou um spinner/loading screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};