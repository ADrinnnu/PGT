import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, BarChart3, Map, Users, Navigation, Truck, 
  CalendarClock, FileText, Settings, ChevronRight, Bell, LogOut, Wallet, Building2, Video
} from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    navigate('/login');
  };

  const userStr = localStorage.getItem('tms_user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin User', role: 'Head Admin' };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-900 overflow-hidden">
      <aside 
        className={`${
          isSidebarOpen ? 'w-[280px]' : 'w-30'
        } bg-slate-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
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

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem to="/dashboard" icon={<BarChart3 />} label="Dashboard" isOpen={isSidebarOpen} active={location.pathname === '/dashboard'} />
          <NavItem to="/cctv" icon={<Video />} label="CCTV" isOpen={isSidebarOpen} active={location.pathname === '/cctv'} />
          <NavItem to="/live-map" icon={<Map />} label="Live Map" isOpen={isSidebarOpen} active={location.pathname === '/live-map'} />
          <NavItem to="/schedule" icon={<CalendarClock />} label="Dispatch" isOpen={isSidebarOpen} active={location.pathname === '/schedule'} />
          
          <div className="my-6 border-t border-slate-700 mx-4"></div>
          
          <NavItem to="/drivers" icon={<Users />} label="Drivers" isOpen={isSidebarOpen} active={location.pathname === '/drivers'} />
          <NavItem to="/vehicles" icon={<Truck />} label="Vehicles" isOpen={isSidebarOpen} active={location.pathname === '/vehicles'} />
          <NavItem to="/routes" icon={<Navigation />} label="Routes" isOpen={isSidebarOpen} active={location.pathname === '/routes'} />
          
          <div className="my-6 border-t border-slate-700 mx-4"></div>
          
{user?.role === 'HeadAdmin' && (
    <NavItem to="/companies" icon={<Building2 />} label="Companies" isOpen={isSidebarOpen} active={location.pathname === '/companies'} />
)}          <NavItem to="/transactions" icon={<Wallet />} label="Transactions" isOpen={isSidebarOpen} active={location.pathname === '/transactions'} />
          <NavItem to="/reports" icon={<FileText />} label="Reports" isOpen={isSidebarOpen} active={location.pathname === '/reports'} />
          <NavItem to="/settings" icon={<Settings />} label="Settings" isOpen={isSidebarOpen} active={location.pathname === '/settings'} />
        </nav>

        <div className="p-6">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <img 
              src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=059669&color=fff`} 
              className="h-9 w-9 rounded-full border border-slate-600" 
              alt="Admin" 
            />
            <div className={`overflow-hidden ${!isSidebarOpen && 'hidden'}`}>
              <h4 className="text-sm font-bold text-white whitespace-nowrap">{user.name}</h4>
              <p className="text-xs text-slate-400 whitespace-nowrap">{user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className={`ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors ${!isSidebarOpen && 'hidden'}`}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen relative py-3 pr-3">
        <div className="flex-1 bg-slate-50 rounded-[40px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative z-10">
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