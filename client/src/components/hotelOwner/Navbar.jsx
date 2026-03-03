import React from "react";
import { Link, NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import { UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const links = [
    { label: "Dashboard", to: "/owner", end: true },
    { label: "Add Room", to: "/owner/add-room" },
    { label: "List Room", to: "/owner/list-room" },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 py-3 bg-white/90 backdrop-blur-md">
      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/">
            <img src={assets.logo2} alt="logo" className="h-10 invert opacity-80" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-block text-base font-medium px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
            >
              Back to Site
            </Link>
            <UserButton />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-5 py-2.5 rounded-xl text-base font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
