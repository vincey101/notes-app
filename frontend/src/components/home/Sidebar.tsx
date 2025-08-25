import React from 'react';
import { LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="h-screen w-16 md:w-52 flex flex-col transition-all duration-300">
      <div className="h-16 bg-[#6B63B7] px-4 flex items-center">
        <span className="text-white text-lg font-semibold hidden md:block">Notes App</span>
        <span className="text-white text-lg font-semibold md:hidden">N</span>
      </div>

      <div className="flex-1 bg-[#8981D7] px-2 md:px-4 py-6 flex flex-col">
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => navigate('/dashboard')}
                className={`w-full flex items-center justify-center md:justify-start gap-3 text-white px-2 md:px-4 py-2 rounded-lg transition-colors ${
                  currentPath === '/dashboard' ? 'bg-[#6B63B7]' : 'hover:bg-[#6B63B7]'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard size={20} />
                <span className="hidden md:block">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/create')}
                className={`w-full flex items-center justify-center md:justify-start gap-3 text-white px-2 md:px-4 py-2 rounded-lg transition-colors ${
                  currentPath === '/create' ? 'bg-[#6B63B7]' : 'hover:bg-[#6B63B7]'
                }`}
                title="Create Note"
              >
                <PlusCircle size={20} />
                <span className="hidden md:block">Create Note</span>
              </button>
            </li>
          </ul>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start gap-3 text-white hover:bg-[#6B63B7] px-2 md:px-4 py-2 rounded-lg transition-colors mt-auto"
          title="Log Out"
        >
          <LogOut size={20} />
          <span className="hidden md:block">Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 