import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Trophy, Menu, X } from "lucide-react";

/**
 * Props for navigation link components.
 */
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Desktop navigation link component.
 *
 * @param {NavLinkProps} props - Contains the href, child elements, and optional onClick handler.
 * @returns {JSX.Element} A styled navigation link.
 */
const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="text-white/80 hover:text-chess-gold transition-colors duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-chess-gold after:transition-all after:duration-300 hover:after:w-full"
    >
      {children}
    </a>
  );
};

/**
 * Mobile navigation link component.
 *
 * @param {NavLinkProps} props - Contains the href, child elements, and optional onClick handler.
 * @returns {JSX.Element} A styled mobile navigation link.
 */
const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-white px-3 py-2 rounded-md hover:bg-white/5 transition-colors duration-200 font-medium"
    >
      {children}
    </a>
  );
};

/**
 * Navbar component that renders the navigation bar.
 *
 * @remarks
 * - Listens to the scroll event to update the background style.
 * - Provides different layouts for desktop and mobile views.
 *
 * @returns {JSX.Element} The rendered Navbar component.
 */
const Navbar: React.FC = () => {
  // State to track if the window has been scrolled to apply a background effect.
  const [isScrolled, setIsScrolled] = useState(false);
  // State to toggle the mobile menu.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // useEffect hook to add a scroll event listener on mount.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    // Cleanup the event listener on component unmount.
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    // The <nav> element is fixed at the top with conditional styling based on scroll.
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12",
        isScrolled
          ? "bg-chess-dark/80 backdrop-blur-md shadow-md border-b border-white/10"
          : "bg-transparent"
      )}
    >
      {/* Container for the navbar content */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          className="flex items-center space-x-2"
          href="#home"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Trophy className="h-8 w-8 text-chess-gold animate-pulse-soft" />
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-chess-gold">Auto</span>
            <span>Match</span>
          </span>
        </a>

        {/* Desktop Menu (hidden on mobile devices) */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="#tournaments">Tournaments</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>

          {/* Action buttons for desktop */}
          <div className="flex items-center space-x-3 ml-4">
            <Button className="primary-btn" size="sm">
              Play Now
            </Button>
            <Button
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              size="sm"
            >
              Log In
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button (visible only on mobile devices) */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-chess-dark/95 backdrop-blur-md shadow-lg animate-slide-down border-b border-white/10 p-4">
          <div className="flex flex-col space-y-4 py-2">
            <MobileNavLink
              href="#tournaments"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tournaments
            </MobileNavLink>
            <MobileNavLink
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </MobileNavLink>
            <MobileNavLink
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </MobileNavLink>

            {/* Action buttons for mobile */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Button className="primary-btn w-full" size="sm">
                Play Now
              </Button>
              <Button
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
                size="sm"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
