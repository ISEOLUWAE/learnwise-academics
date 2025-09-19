import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Zap, Users, BookOpen, Award, TrendingUp } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Students Enrolled", value: "15,000+", icon: Users },
    { label: "Courses Available", value: "500+", icon: BookOpen },
    { label: "Quizzes Taken", value: "50,000+", icon: Award },
    { label: "Success Rate", value: "95%", icon: TrendingUp }
  ];

  const drives = [
    {
      icon: Target,
      title: "Excellence in Education",
      description: "We strive to provide the highest quality educational resources and tools to help students achieve academic excellence."
    },
    {
      icon: Zap,
      title: "Innovation & Technology",
      description: "Leveraging cutting-edge technology to create engaging and interactive learning experiences for modern students."
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Fostering a supportive community where students can collaborate, learn together, and achieve their goals."
    }
  ];

  return (
    <Layout>
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About <span className="hero-text">SmartLearn</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Empowering the next generation of learners through innovative educational technology
                and comprehensive academic resources.
              </p>
              <Badge variant="outline" className="text-brand-blue border-brand-blue px-4 py-2">
                Established 2024
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      To democratize quality education by providing accessible, comprehensive, and 
                      innovative learning tools that empower students to excel academically and 
                      achieve their career aspirations. We believe every student deserves access 
                      to excellent educational resources regardless of their background or location.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mb-4">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      To become the leading educational platform in Africa, recognized for 
                      transforming how students learn and succeed in their academic pursuits. 
                      We envision a future where every student has the tools and support needed 
                      to unlock their full potential and contribute meaningfully to society.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Counter */}
        <section className="py-20 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our <span className="hero-text">Impact</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Numbers that showcase our commitment to educational excellence and student success
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 text-center">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue/10 rounded-lg mb-4">
                        <stat.icon className="h-8 w-8 text-brand-blue" />
                      </div>
                      <div className="text-3xl font-bold text-brand-blue mb-2">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Drive */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What <span className="hero-text">Drives</span> Us
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The core values and motivations that fuel our commitment to transforming education
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {drives.map((drive, index) => (
                <motion.div
                  key={drive.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full text-center">
                    <CardHeader>
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-lg mb-4 mx-auto">
                        <drive.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{drive.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {drive.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-primary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join thousands of students who are already achieving their academic goals with SmartLearn
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Get Started Today
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;