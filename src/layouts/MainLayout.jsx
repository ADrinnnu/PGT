import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, BarChart3, Map, Users, Navigation, Truck, 
  CalendarClock, FileText, Settings, ChevronRight, Bell, LogOut, Wallet
} from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    // 1. OUTER BACKGROUND: Dark (slate-900) to match the sidebar
    <div className="flex h-screen bg-slate-900 font-sans text-slate-900 overflow-hidden">
      
      {/* --- SIDEBAR (Dark Mode) --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-[280px]' : 'w-20'
        } bg-slate-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Truck className="text-white" size={20} />
            </div>
            <span className={`font-extrabold text-2xl text-white ${!isSidebarOpen && 'hidden'}`}>
              TMS<span className="text-emerald-500">.</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem to="/dashboard" icon={<BarChart3 />} label="Dashboard" isOpen={isSidebarOpen} active={location.pathname === '/dashboard'} />
          <NavItem to="/live-map" icon={<Map />} label="Live Map" isOpen={isSidebarOpen} active={location.pathname === '/live-map'} />
          <NavItem to="/schedule" icon={<CalendarClock />} label="Dispatch" isOpen={isSidebarOpen} active={location.pathname === '/schedule'} />
          
          <div className="my-6 border-t border-slate-700 mx-4"></div>
          
          <NavItem to="/drivers" icon={<Users />} label="Drivers" isOpen={isSidebarOpen} active={location.pathname === '/drivers'} />
          <NavItem to="/vehicles" icon={<Truck />} label="Vehicles" isOpen={isSidebarOpen} active={location.pathname === '/vehicles'} />
          <NavItem to="/routes" icon={<Navigation />} label="Routes" isOpen={isSidebarOpen} active={location.pathname === '/routes'} />
          
          <div className="my-6 border-t border-slate-700 mx-4"></div>
          <NavItem to="/transactions" icon={<Wallet />} label="Transactions" isOpen={isSidebarOpen} active={location.pathname === '/transactions'} />
          <NavItem to="/reports" icon={<FileText />} label="Reports" isOpen={isSidebarOpen} active={location.pathname === '/reports'} />
          <NavItem to="/settings" icon={<Settings />} label="Settings" isOpen={isSidebarOpen} active={location.pathname === '/settings'} />
        </nav>

        {/* User Profile */}
        <div className="p-6">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm cursor-pointer hover:bg-slate-700 transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=059669&color=fff" className="h-9 w-9 rounded-full border border-slate-600" alt="Admin" />
            <div className={`overflow-hidden ${!isSidebarOpen && 'hidden'}`}>
              <h4 className="text-sm font-bold text-white">Admin User</h4>
              <p className="text-xs text-slate-400">Head Admin</p>
            </div>
            <LogOut size={16} className={`text-slate-400 ml-auto hover:text-red-400 ${!isSidebarOpen && 'hidden'}`} />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* 2. THE CURVE: We pad the wrapper (py-3 pr-3). 
          Because the background behind is slate-900 (Dark), the "corners" will look dark, 
          matching the sidebar perfectly. */}
      <div className="flex-1 flex flex-col h-screen relative py-3 pr-3">
        
        {/* The White "Paper" Card */}
        <div className="flex-1 bg-slate-50 rounded-[40px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative z-10">
          
          {/* Header */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-8 custom-scrollbar">
             <div className="max-w-7xl mx-auto animate-fade-in-up">
                <Outlet />
             </div>
          </main>

        </div>
      </div>

    </div>
  );
};

// Helper Component for Navigation Links (Dark Mode Version)
const NavItem = ({ to, icon, label, isOpen, active }) => (
  <Link 
    to={to} 
    className={`
      flex items-center gap-3 px-4 py-3 mx-2 rounded-2xl transition-all duration-300 group
      ${active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400'
      }
    `}
  >
    <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`}>
      {icon}
    </div>
    <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
      {label}
    </span>
    {active && isOpen && <ChevronRight size={16} className="ml-auto text-emerald-100/50" />}
  </Link>
);

export default MainLayout;