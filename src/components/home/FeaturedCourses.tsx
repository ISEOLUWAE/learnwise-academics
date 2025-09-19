import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Users, Star } from "lucide-react";
import { useState } from "react";

const featuredCourses = [
  {
    id: 1,
    title: "Elementary Mathematics I",
    code: "MTH 101",
    description: "Fundamental mathematical concepts including algebra, trigonometry, and basic calculus.",
    level: "100 Level",
    units: 2,
    students: 1250,
    rating: 4.8,
    duration: "12 weeks",
    thumbnail: "bg-gradient-to-br from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "Introduction to Computing",
    code: "COS 101",
    description: "Basic computing concepts, programming fundamentals, and computer systems.",
    level: "100 Level",
    units: 3,
    students: 980,
    rating: 4.9,
    duration: "15 weeks",
    thumbnail: "bg-gradient-to-br from-green-500 to-blue-600"
  },
  {
    id: 3,
    title: "Communication in English",
    code: "GST 111",
    description: "Effective communication skills, academic writing, and presentation techniques.",
    level: "100 Level",
    units: 2,
    students: 1500,
    rating: 4.6,
    duration: "12 weeks",
    thumbnail: "bg-gradient-to-br from-purple-500 to-pink-600"
  },
  {
    id: 4,
    title: "General Physics I",
    code: "PHY 101",
    description: "Classical mechanics, thermodynamics, and wave motion principles.",
    level: "100 Level",
    units: 2,
    students: 890,
    rating: 4.7,
    duration: "14 weeks",
    thumbnail: "bg-gradient-to-br from-orange-500 to-red-600"
  }
];

const FeaturedCourses = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesPerPage = 3;
  const maxIndex = Math.max(0, featuredCourses.length - coursesPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section className="py-20 bg-bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="hero-text">Courses</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our most popular courses designed to help you excel in your academic journey
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-primary/80 backdrop-blur"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-bg-primary/80 backdrop-blur"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Courses grid */}
          <div className="overflow-hidden mx-12">
            <motion.div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / coursesPerPage)}%)` }}
            >
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-full md:w-1/3 flex-shrink-0 px-3"
                >
                  <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                    {/* Course thumbnail */}
                    <div className={`h-40 ${course.thumbnail} rounded-t-lg relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <Badge className="absolute top-3 left-3 bg-white/20 text-white border-white/30">
                        {course.level}
                      </Badge>
                      <Badge className="absolute top-3 right-3 bg-brand-blue text-white">
                        {course.units} Units
                      </Badge>
                    </div>

                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-brand-blue border-brand-blue">
                          {course.code}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button variant="gradient" className="w-full">
                        View Course
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-brand-blue" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;