import { ArrowUp, ArrowDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, color, subText }) => {
  const colors = {
    blue: "bg-blue-600",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
    purple: "bg-purple-600",
    white: "bg-white text-slate-800 border border-slate-100"
  };

  const isWhite = color === 'white';

  return (
    <div className={`${colors[color]} rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div className="z-10">
          <h4 className={`text-sm font-bold uppercase tracking-wider ${isWhite ? 'text-slate-400' : 'text-blue-100/80'}`}>{title}</h4>
          <h3 className={`text-3xl font-black mt-2 ${isWhite ? 'text-slate-800' : 'text-white'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${isWhite ? 'bg-slate-50 text-slate-600' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-sm font-medium z-10 relative">
        <span className={`flex items-center ${trend >= 0 ? (isWhite ? 'text-emerald-500' : 'text-white') : 'text-red-200'} bg-white/10 px-2 py-1 rounded-lg`}>
          {trend >= 0 ? <ArrowUp size={14} className="mr-1"/> : <ArrowDown size={14} className="mr-1"/>}
          {Math.abs(trend)}%
        </span>
        <span className={`ml-3 ${isWhite ? 'text-slate-400' : 'text-blue-100/70'}`}>{subText || "vs last month"}</span>
      </div>

      {/* Decorative Circle Background */}
      {!isWhite && (
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      )}
    </div>
  );
};