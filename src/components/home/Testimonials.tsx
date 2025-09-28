import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Adebayo Johnson",
    role: "Computer Science Student",
    university: "University of Lagos",
    avatar: "AJ",
    rating: 5,
    testimonial: "AcadBridge's GPA calculator helped me track my academic progress effectively. The course materials are comprehensive and the quiz section really prepared me for exams. I improved my CGPA from 3.2 to 4.1!"
  },
  {
    id: 2,
    name: "Fatima Mohammed",
    role: "Mathematics Education",
    university: "Ahmadu Bello University",
    avatar: "FM",
    rating: 5,
    testimonial: "The platform's mathematics courses are excellent! The step-by-step explanations and practice problems helped me understand complex concepts. The AI assistance feature is incredibly helpful for solving difficult problems."
  },
  {
    id: 3,
    name: "Emeka Okafor",
    role: "Information Technology",
    university: "University of Nigeria, Nsukka",
    avatar: "EO",
    rating: 5,
    testimonial: "I love the programming courses and web development materials. The community section allowed me to connect with other students and learn collaboratively. AcadBridge made my IT journey much smoother!"
  },
  {
    id: 4,
    name: "Aisha Ibrahim",
    role: "Business Administration",
    university: "University of Abuja",
    avatar: "AI",
    rating: 5,
    testimonial: "The scholarship updates and university news keep me informed about opportunities. I've applied to several scholarships I found through AcadBridge. The platform is a game-changer for Nigerian students!"
  },
  {
    id: 5,
    name: "David Okonkwo",
    role: "Engineering Student",
    university: "University of Benin",
    avatar: "DO",
    rating: 5,
    testimonial: "The physics and mathematics resources are top-notch. Past questions section helped me prepare for my engineering courses. The course materials are well-organized and easy to understand."
  },
  {
    id: 6,
    name: "Grace Adeleke",
    role: "Pharmacy Student",
    university: "University of Ibadan",
    avatar: "GA",
    rating: 5,
    testimonial: "AcadBridge's chemistry and biology courses complement my pharmacy studies perfectly. The interactive quizzes and detailed explanations have significantly improved my understanding of complex topics."
  }
];

const Testimonials = () => {
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
            Student <span className="hero-text">Testimonials</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our successful students who have transformed their academic journey with AcadBridge
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full relative">
                <Quote className="absolute top-4 right-4 h-6 w-6 text-brand-blue/30" />
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.testimonial}"
                  </p>
                  
                  {/* Student info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${testimonial.avatar.toLowerCase()}.jpg`} />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-brand-blue">{testimonial.university}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;