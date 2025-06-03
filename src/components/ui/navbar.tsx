import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb, User, LogOut, BarChart3, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  onSignOut?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignOut, activeTab, onTabChange }) => {
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine which navigation links to show based on user role
  const getNavLinks = () => {
    if (!userProfile) return [];
    
    const baseLinks = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
    ];
    
    switch (userProfile.role) {
      case 'employee':
        return [
          ...baseLinks,
          { id: 'tickets', label: 'My Tickets', icon: MessageSquare },
          { id: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      case 'support_agent':
        return [
          ...baseLinks,
          { id: 'tickets', label: 'Tickets', icon: MessageSquare },
          { id: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      case 'manager':
      case 'super_admin':
        return [
          ...baseLinks,
          { id: 'tickets', label: 'All Tickets', icon: MessageSquare },
          { id: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      default:
        return baseLinks;
    }
  };
  
  const navLinks = getNavLinks();
  
  return (
    <header className="bg-slate-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">HelpDesk Pro</h1>
                <p className="text-sm text-gray-300">AI-Powered Ticket Management</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">HelpDesk</h1>
              </div>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
          
          {/* Desktop Navigation Links */}
          {user && userProfile && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Button
                  key={link.id}
                  variant={activeTab === link.id ? "secondary" : "ghost"}
                  className={`text-white hover:bg-gray-700 ${activeTab === link.id ? 'bg-gray-700' : ''}`}
                  onClick={() => handleTabClick(link.id)}
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/self-serve-help">
              <Button variant="ghost" className="text-white hover:bg-gray-700">
                <Lightbulb className="h-4 w-4 mr-2" />
                Self-Serve Help
              </Button>
            </Link>
            
            {user && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        {getInitials(userProfile.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">{userProfile.role.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600" 
                    onClick={onSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && user && userProfile && (
          <div className="md:hidden py-2 px-2 space-y-1 bg-slate-700 rounded-b-lg">
            {navLinks.map((link) => (
              <Button
                key={link.id}
                variant={activeTab === link.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-white hover:bg-gray-600 ${activeTab === link.id ? 'bg-gray-600' : ''}`}
                onClick={() => handleTabClick(link.id)}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
            ))}
            
            <div className="pt-2 border-t border-gray-600">
              <Link to="/self-serve-help" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-600">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Self-Serve Help
                </Button>
              </Link>
              
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:bg-gray-600 hover:text-red-300"
                onClick={() => {
                  if (onSignOut) onSignOut();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 