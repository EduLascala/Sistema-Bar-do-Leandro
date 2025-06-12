import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to tables page
    navigate('/tables');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">Redirecionando...</p>
    </div>
  );
};

export default Dashboard;