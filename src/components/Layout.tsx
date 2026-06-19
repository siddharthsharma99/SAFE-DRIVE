import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  MapPin, 
  ShieldAlert, 
  Users, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ThemeToggle } from './ThemeToggle';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Detect', path: '/detect', icon: ShieldAlert },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Alerts', path: '/alerts', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-transform duration-300 lg:static lg:block",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h1 className="text-xl font-mono font-bold tracking-tighter uppercase italic">
              Guardia AI <span className="not-italic text-sm opacity-50 block mt-1">v1.0</span>
            </h1>
            <div className="lg:hidden">
               <ThemeToggle />
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-mono transition-all group",
                  location.pathname === item.path 
                    ? "bg-foreground text-background" 
                    : "hover:bg-foreground hover:text-background"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <MapPin className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full justify-start gap-3 rounded-none border-border hover:bg-foreground hover:text-background"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-mono text-xs uppercase">Terminate Session</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden p-4 border-b border-border flex items-center justify-between">
           <h1 className="text-sm font-mono font-bold uppercase italic">Guardia AI</h1>
           <div className="flex items-center gap-2">
             <ThemeToggle />
             <Button variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
               {isSidebarOpen ? <X /> : <Menu />}
             </Button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
