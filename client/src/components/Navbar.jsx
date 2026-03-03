import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const BookIcon = () => (
  <svg className="w-4 h-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 011-1h12a1 1 0 011 1v13H7a2 2 0 00-2 2Zm0 0a2 2 0 002 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/", action: "home" },
    { name: "Hotels", path: "/all-available-rooms" },
    { name: "Experience", path: "#testimonials" },
    { name: "About", path: "#newsletter" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isOwner, setShowHotelReg } = useAppContext();

  useEffect(() => {
    const isTransparentAllowed = location.pathname === "/";
    const handleScroll = () => {
      if (!isTransparentAllowed) {
        setIsScrolled(true);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleNavClick = (link) => {
    setIsMenuOpen(false);
    if (link.action === "home") {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } else if (link.path.startsWith("#")) {
      const el = document.getElementById(link.path.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          const target = document.getElementById(link.path.slice(1));
          if (target) target.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    } else {
      navigate(link.path);
    }
  };

  const navTheme = isScrolled
    ? "bg-white/80 border border-white/70 shadow-xl text-slate-700 backdrop-blur-xl"
    : "bg-slate-900/30 border border-white/20 text-white backdrop-blur-md";

  return (
    <nav className="fixed top-0 left-0 w-full px-4 md:px-10 lg:px-14 py-4 z-50">
      <div
        className={`mx-auto max-w-7xl rounded-2xl px-4 md:px-6 lg:px-8 py-3 transition-all duration-500 ${navTheme}`}
      >
        <div className="flex items-center justify-between">
          <div onClick={() => handleNavClick(navLinks[0])} className="flex items-center gap-2 cursor-pointer">
            <img src={assets.logo2} alt="logo" className={`h-14 ${isScrolled ? "invert opacity-85" : ""}`} />
          </div>

          <div className="hidden md:flex items-center gap-5 lg:gap-8">
            {navLinks.map((link, i) => (
              <span
                key={i}
                onClick={() => handleNavClick(link)}
                className="group flex flex-col gap-0.5 cursor-pointer text-sm lg:text-base"
              >
                {link.name}
                <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-300 ${isScrolled ? "bg-slate-700" : "bg-white"}`} />
              </span>
            ))}
            {user && (
              <button
                onClick={() => (isOwner ? navigate("/owner") : setShowHotelReg(true))}
                className={`px-4 py-1.5 text-sm rounded-full cursor-pointer transition-all border ${
                  isScrolled
                    ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-700"
                    : "bg-white/15 border-white/40 text-white hover:bg-white/25"
                }`}
              >
                {isOwner ? "Dashboard" : "Add Hotel"}
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Bookings"
                    labelIcon={<BookIcon />}
                    onClick={() => navigate("/my-bookings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <button
                onClick={openSignIn}
                className={`px-6 py-2 rounded-full transition-all cursor-pointer ${
                  isScrolled
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                Login
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {user && (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Bookings"
                    labelIcon={<BookIcon />}
                    onClick={() => navigate("/my-bookings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}
            <img
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              src={assets.menuIcon}
              alt="menu"
              className={`h-4 ${isScrolled ? "invert" : ""}`}
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-slate-950/95 text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-white transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
          <img src={assets.closeIcon} alt="close-menu" className="h-6.5 invert" />
        </button>
        {navLinks.map((link, i) => (
          <span key={i} onClick={() => handleNavClick(link)} className="cursor-pointer">
            {link.name}
          </span>
        ))}
        {user && (
          <button
            onClick={() => (isOwner ? navigate("/owner") : setShowHotelReg(true))}
            className="border border-white/40 px-4 py-1 text-sm rounded-full cursor-pointer transition-all"
          >
            {isOwner ? "Dashboard" : "Add Hotel"}
          </button>
        )}
        {!user && (
          <button
            onClick={openSignIn}
            className="bg-white text-slate-900 px-8 py-2.5 rounded-full transition-all duration-500"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
