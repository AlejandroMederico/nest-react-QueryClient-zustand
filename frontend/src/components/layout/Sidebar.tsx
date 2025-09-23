import { BookOpen, Home, LogOut, Users } from 'react-feather';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import sidebarBg from '../../assets/sidemenu-bg.jpg';
import logo from '../../assets/urbano-logo-white.png';
import authService from '../../services/AuthService';
import useAuth from '../../store/authStore';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  className: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const history = useHistory();

  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    setAuthenticatedUser(null);
    history.push('/login');
  };

  return (
    <div
      className={`sidebar bg-cover bg-center ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${sidebarBg})`,
      }}
    >
      <div className="p-6">
        <Link to="/" className="no-underline text-white block">
          <img
            src={logo}
            alt="Logo"
            className="mx-auto mb-6 h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </Link>
      </div>
      <nav className="px-4 flex flex-col gap-2 flex-grow">
        <SidebarItem to="/">
          <Home /> Dashboard
        </SidebarItem>
        <SidebarItem to="/courses">
          <BookOpen /> Courses
        </SidebarItem>
        {authenticatedUser.role === 'admin' ? (
          <SidebarItem to="/users">
            <Users /> Users
          </SidebarItem>
        ) : null}
      </nav>
      <div className="mt-auto p-4">
        <button
          className="w-full text-white bg-red-600 hover:bg-red-700 rounded-lg p-3 transition-colors flex gap-3 justify-center items-center font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={handleLogout}
        >
          <LogOut /> Logout
        </button>
      </div>
    </div>
  );
}
