import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, User, LogOut, Calculator, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GPACalculator from "@/components/courses/GPACalculator";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGPAOpen, setIsGPAOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "News", path: "/news" },
    { name: "Scholarships", path: "/scholarships" },
    { name: "Contact", path: "/contact" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-lg border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold hero-text">SmartLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`link-underline transition-colors duration-300 ${
                  isActivePath(item.path)
                    ? "text-brand-blue"
                    : "text-foreground hover:text-brand-blue"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsGPAOpen(true)}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              GPA Calculator
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="gradient" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-secondary/95 backdrop-blur-lg rounded-lg mt-2 p-4"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`transition-colors duration-300 ${
                    isActivePath(item.path)
                      ? "text-brand-blue"
                      : "text-foreground hover:text-brand-blue"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setIsGPAOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  GPA Calculator
                </Button>
                
                {user ? (
                  <>
                    <div className="text-center text-sm text-muted-foreground py-2">
                      {user.email}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="gradient" size="sm" className="w-full">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>

      {/* GPA Calculator Modal */}
      <GPACalculator isOpen={isGPAOpen} onClose={() => setIsGPAOpen(false)} />
    </motion.header>
  );
};

export default Header;