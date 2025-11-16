import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary opacity-90" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 px-4"
          >
            Learn <span className="hero-text">Smarter</span>, <br />
            Achieve <span className="hero-text">More!</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
          >
            Unlock your potential with our comprehensive educational platform. Access quality courses, 
            calculate your GPA, find academic resources, and join a community of motivated learners.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4"
          >
            <Button variant="hero" size="xl" className="group w-full sm:w-auto" asChild>
              <Link to="/courses">
                Get Started
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline_glow" size="xl" className="group w-full sm:w-auto">
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue/10 rounded-lg mb-2 sm:mb-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-brand-blue" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-brand-blue">10,000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-brand-green/10 rounded-lg mb-2 sm:mb-3">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-brand-green" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-brand-green">500+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Quality Courses</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-brand-purple/10 rounded-lg mb-2 sm:mb-3">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-brand-purple" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-brand-purple">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brand-blue/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-brand-purple/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-green/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSection;