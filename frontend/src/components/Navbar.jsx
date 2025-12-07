
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../service/AuthContext";

export default function NavBar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = (() => {
    if (!user) return "U";
    const name = user.name || user.email || "";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "bg-[#4ADE80] text-[#0F172A] shadow-sm" 
        : "text-[#0F172A] hover:bg-[#D1FAE5]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "bg-[#4ADE80] text-[#0F172A] shadow-sm" 
        : "text-[#0F172A] hover:bg-[#D1FAE5]"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-[#0F172A] hover:text-[#14B8A6] transition-colors duration-200"
            >
              Money Mitra
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-2">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/transaction" className={linkClass}>
                Transactions
              </NavLink>
              {/* <NavLink to="/category" className={linkClass}>
                Categories
              </NavLink> */}
            </nav>
          </div>

          <div className="flex items-center gap-4">
        
            {user ? (
              <Link 
                to="/profile" 
                className="relative group"
              >
                <span
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#D1FAE5] text-[#0F172A] font-semibold text-sm border-2 border-transparent group-hover:border-[#4ADE80] transition-all duration-200"
                  title={user.name || user.email}
                >
                  {initials}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl border-2 border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white transition-all duration-200"
              >
                Login
              </Link>
            )}

         
            <div className="sm:hidden">
              <button
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#0F172A] hover:bg-[#D1FAE5] transition-colors duration-200"
                aria-expanded={open}
                aria-label="Toggle menu"
              >
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {open ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  ) : (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

   
      {open && (
        <div className="sm:hidden border-t border-gray-200 bg-[#F3F4F6]">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <NavLink 
              to="/" 
              className={mobileLinkClass} 
              end 
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/transaction" 
              className={mobileLinkClass} 
              onClick={() => setOpen(false)}
            >
              Transactions
            </NavLink>
            {/* <NavLink 
              to="/category" 
              className={mobileLinkClass} 
              onClick={() => setOpen(false)}
            >
              Categories
            </NavLink> */}
            {user ? (
              <NavLink 
                to="/profile" 
                className={mobileLinkClass} 
                onClick={() => setOpen(false)}
              >
                Profile
              </NavLink>
            ) : (
              <NavLink 
                to="/login" 
                className={mobileLinkClass} 
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}