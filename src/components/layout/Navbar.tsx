import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { APP_NAME } from "../../lib/constants";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-slate-900"
  }`;

export const Navbar: React.FC = () => (
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white">
          <FlaskConical size={20} />
        </div>
        <span className="font-bold text-lg text-slate-900">{APP_NAME}</span>
      </Link>
      <nav className="flex items-center gap-1">
        <NavLink to="/" className={linkCls} end>Home</NavLink>
        <NavLink to="/modules" className={linkCls}>Modules</NavLink>
        <NavLink to="/about" className={linkCls}>About</NavLink>
      </nav>
    </div>
  </header>
);