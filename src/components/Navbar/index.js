import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { BellIcon, MenuIcon, XIcon, UserIcon, LogOutIcon } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, logout } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
      variant: 'success'
    });
    navigate('/login');
  };

  const showNotificationDemo = () => {
    toast({
      title: 'Success Notification',
      description: 'This is a success notification example',
      variant: 'success'
    });
    setTimeout(() => {
      toast({
        title: 'Warning Notification',
        description: 'This is a warning notification example',
        variant: 'warning'
      });
    }, 1000);
    setTimeout(() => {
      toast({
        title: 'Error Notification',
        description: 'This is an error notification example',
        variant: 'destructive'
      });
    }, 2000);
    setTimeout(() => {
      toast({
        title: 'Info Notification',
        description: 'This is an info notification example',
        variant: 'info'
      });
    }, 3000);
  };

  return (
    <nav className="bg-primary text-primary-foreground h-[70px] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold" onClick={closeMenu}>
          TruckTracker
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
        >
          {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </Button>

        <ul className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-[70px] left-0 w-full md:w-auto bg-primary md:bg-transparent z-40 md:items-center gap-1 md:gap-2 p-4 md:p-0`}>
          <li>
            <Link
              to="/"
              className={`block px-4 py-2 rounded-md ${location.pathname === '/' ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/trucks"
              className={`block px-4 py-2 rounded-md ${location.pathname.startsWith('/trucks') ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Trucks
            </Link>
          </li>
          <li>
            <Link
              to="/drivers"
              className={`block px-4 py-2 rounded-md ${location.pathname === '/drivers' ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Drivers
            </Link>
          </li>
          <li>
            <Link
              to="/maintenance"
              className={`block px-4 py-2 rounded-md ${location.pathname === '/maintenance' ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Maintenance
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className={`block px-4 py-2 rounded-md ${location.pathname === '/reports' ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Reports
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`block px-4 py-2 rounded-md ${location.pathname === '/settings' ? 'bg-primary-foreground/10 font-medium' : 'hover:bg-primary-foreground/5'}`}
              onClick={closeMenu}
            >
              Settings
            </Link>
          </li>
          <li>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-4 py-2 w-full justify-start"
              onClick={showNotificationDemo}
            >
              <BellIcon className="h-4 w-4" /> Demo Notifications
            </Button>
          </li>
          <li className="md:hidden mt-2 pt-2 border-t border-primary-foreground/10">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-4 py-2 w-full justify-start text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" /> Logout
            </Button>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {currentUser?.firstName ||
               (localStorage.getItem('user') ?
                 JSON.parse(localStorage.getItem('user'))?.firstName :
                 'User')}
            </span>
            <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="hover:bg-primary-foreground/10"
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
