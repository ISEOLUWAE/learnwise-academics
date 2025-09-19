import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Database, Shield, Globe, Brain, Smartphone } from "lucide-react";

const digitalSkills = [
  {
    icon: Code,
    title: "Programming & Development",
    description: "Master modern programming languages and development frameworks",
    courses: ["Python Programming", "Web Development", "Mobile App Development"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Database,
    title: "Data Science & Analytics",
    description: "Learn to analyze data and build intelligent systems",
    courses: ["Data Analysis", "Machine Learning", "Statistical Computing"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Protect digital assets and understand security principles",
    courses: ["Network Security", "Ethical Hacking", "Digital Forensics"],
    color: "from-red-500 to-orange-500"
  },
  {
    icon: Globe,
    title: "Digital Marketing",
    description: "Master online marketing and social media strategies",
    courses: ["SEO Optimization", "Social Media Marketing", "Content Strategy"],
    color: "from-green-500 to-teal-500"
  },
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Explore artificial intelligence and neural networks",
    courses: ["Deep Learning", "Computer Vision", "Natural Language Processing"],
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Smartphone,
    title: "Digital Design",
    description: "Create stunning digital experiences and interfaces",
    courses: ["UI/UX Design", "Graphic Design", "Motion Graphics"],
    color: "from-pink-500 to-rose-500"
  }
];

const DigitalSkillset = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Digital <span className="hero-text">Skillset</span> Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay ahead in the digital age with our comprehensive technology and digital skills courses
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {digitalSkills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${skill.color} flex items-center justify-center mb-4`}>
                    <skill.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{skill.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {skill.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Featured Courses:</h4>
                    <ul className="space-y-1">
                      {skill.courses.map((course, courseIndex) => (
                        <li key={courseIndex} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mr-2" />
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Explore Courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg">
            View All Digital Courses
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalSkillset;