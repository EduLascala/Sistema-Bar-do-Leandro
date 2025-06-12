import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  Coffee, 
  Layers, 
  BarChart3, 
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      name: 'Mesas', 
      path: '/tables', 
      icon: <Coffee className="w-6 h-6" /> 
    },
    { 
      name: 'Produtos', 
      path: '/products', 
      icon: <ShoppingBag className="w-6 h-6" /> 
    },
    { 
      name: 'Relatórios', 
      path: '/reports', 
      icon: <BarChart3 className="w-6 h-6" /> 
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <Layers className="w-8 h-8 mr-2 text-emerald-500" />
          <h1 className="text-xl font-semibold">Bar do Lê</h1>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700 md:hidden">
          <div className="flex items-center">
            <button
              className="p-1 mr-4 text-gray-400 rounded-md hover:text-white focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center">
              <Layers className="w-7 h-7 mr-2 text-emerald-500" />
              <h1 className="text-lg font-semibold">Bar do Lê</h1>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-20 bg-gray-800 border-b border-gray-700 md:hidden">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
              <button
                className="flex items-center px-4 py-3 text-sm text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Content - Adicionado px-4 para padding horizontal consistente */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6 sm:px-6 px-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;