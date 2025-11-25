import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { useAppContext } from '../context/AppContext';

const BookIcon = () => (
  <svg className="w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M5 19V4a1 1 0 011-1h12a1 1 0 011 1v13H7a2 2 0 00-2 2Zm0 0a2 2 0 002 2h12M9 3v14m7 0v4" />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: 'Home', path: '/', action: 'home' },
    { name: 'Hotels', path: '/all-available-rooms' },
    { name: 'Experience', path: '#testimonials' },
    { name: 'About', path: '#newsletter' },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isOwner, setShowHotelReg } = useAppContext();

  useEffect(() => {
  const isTransparentAllowed = location.pathname === '/';

  const handleScroll = () => {
    if (!isTransparentAllowed) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 10);
    }
  };

  handleScroll(); // Initial check
  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, [location.pathname]);



  const handleNavClick = (link) => {
    setIsMenuOpen(false);

    if (link.action === 'home') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (link.path.startsWith('#')) {
      const el = document.getElementById(link.path.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(link.path.slice(1));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } else {
      navigate(link.path);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-2" : "py-2 text-white"}`}>
      {/* Logo */}
      <div onClick={() => handleNavClick(navLinks[0])} className="flex items-center gap-2 cursor-pointer">
        <img src={assets.logo2} alt="logo" className={`h-20 ${isScrolled && "invert"}`} />
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <span key={i} onClick={() => handleNavClick(link)} className={`group flex flex-col gap-0.5 cursor-pointer ${isScrolled ? "text-gray-700" : "text-white"}`}>
            {link.name}
            <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
          </span>
        ))}
        {user && (
          <button
            onClick={() => isOwner ? navigate("/owner") : setShowHotelReg(true)}
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`}
          >
            {isOwner ? "Dashboard" : "List Your Hotel"}
          </button>
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <img src={assets.searchIcon} alt="search" className={`${isScrolled && "invert"} h-7 transition-all duration-500`} />
        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label='My Bookings' labelIcon={<BookIcon />} onClick={() => navigate("/my-bookings")} />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500">Login</button>
        )}
      </div>

      {/* Mobile Nav Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label='My Bookings' labelIcon={<BookIcon />} onClick={() => navigate("/my-bookings")} />
            </UserButton.MenuItems>
          </UserButton>
        )}
        <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={assets.menuIcon} alt="menu" className={`${isScrolled && "invert"} h-4`} />
      </div>

      {/* Mobile Nav Menu */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
          <img src={assets.closeIcon} alt="close-menu" className={`${isScrolled && "invert"} h-6.5`} />
        </button>
        {navLinks.map((link, i) => (
          <span key={i} onClick={() => handleNavClick(link)} className="cursor-pointer">{link.name}</span>
        ))}
        {user && (
          <button onClick={() => isOwner ? navigate("/owner") : setShowHotelReg(true)} className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all">
            {isOwner ? "Dashboard" : "List Your Hotel"}
          </button>
        )}
        {!user && (
          <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
