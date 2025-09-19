import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-bg-secondary/50 backdrop-blur-lg border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold hero-text">SmartLearn</span>
            </div>
            <p className="text-muted-foreground">
              Empowering students with quality education and innovative learning tools to achieve academic excellence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-brand-blue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                About Us
              </Link>
              <Link to="/courses" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                Courses
              </Link>
              <Link to="/news" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                News
              </Link>
              <Link to="/scholarships" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                Scholarships
              </Link>
            </div>
          </div>

          {/* Academic */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic</h3>
            <div className="space-y-2">
              <Link to="/courses" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                Course Finder
              </Link>
              <Link to="/courses" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                GPA Calculator
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                Academic Calendar
              </a>
              <a href="#" className="block text-muted-foreground hover:text-brand-blue transition-colors">
                Student Portal
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@smartlearn.edu</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 SmartLearn. All rights reserved. | Built with passion for education.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;