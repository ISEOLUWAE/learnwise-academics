import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, BookOpen, GraduationCap } from "lucide-react";

const newsData = [
  {
    id: 1,
    title: "2024 Post-UTME Registration Opens",
    category: "Admissions",
    date: "2024-03-15",
    excerpt: "Federal universities announce the commencement of Post-UTME screening exercises for 2024/2025 academic session.",
    content: "All prospective candidates who scored 180 and above in the 2024 UTME are eligible to participate in the Post-UTME screening...",
    isExternal: true,
    link: "https://jamb.gov.ng"
  },
  {
    id: 2,
    title: "New Computer Science Curriculum Approved",
    category: "Academic",
    date: "2024-03-10",
    excerpt: "The National Universities Commission (NUC) approves updated Computer Science curriculum focusing on AI and Machine Learning.",
    content: "The new curriculum includes courses in Artificial Intelligence, Machine Learning, Data Science, and Cybersecurity...",
    isExternal: false
  },
  {
    id: 3,
    title: "Federal Government Scholarship Program 2024",
    category: "Scholarships",
    date: "2024-03-08",
    excerpt: "Application opens for federal government undergraduate and postgraduate scholarship awards.",
    content: "The scholarship covers tuition fees, accommodation, and monthly stipends for qualified Nigerian students...",
    isExternal: true,
    link: "https://scholarships.gov.ng"
  },
  {
    id: 4,
    title: "University Academic Calendar Update",
    category: "Academic",
    date: "2024-03-05",
    excerpt: "Universities announce revised academic calendar for the 2024/2025 session following recent adjustments.",
    content: "The new academic calendar shows that the first semester will commence on October 1st, 2024...",
    isExternal: false
  }
];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ["All", "Admissions", "Academic", "Scholarships", "General"];

  const filteredNews = newsData.filter(item => 
    selectedCategory === "All" || item.category === selectedCategory
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Admissions": return <GraduationCap className="h-4 w-4" />;
      case "Academic": return <BookOpen className="h-4 w-4" />;
      case "Scholarships": return <ExternalLink className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Admissions": return "bg-brand-blue/20 text-brand-blue border-brand-blue";
      case "Academic": return "bg-brand-green/20 text-brand-green border-brand-green";
      case "Scholarships": return "bg-brand-orange/20 text-brand-orange border-brand-orange";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

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
                <span className="hero-text">Latest</span> News & Updates
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Stay updated with the latest university news, admission updates, and academic announcements
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2"
                >
                  {getCategoryIcon(category)}
                  {category}
                </Button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(news.category)}
                        >
                          {getCategoryIcon(news.category)}
                          {news.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(news.date).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {news.excerpt}
                      </p>
                      
                      {news.isExternal ? (
                        <Button 
                          variant="gradient" 
                          className="w-full"
                          onClick={() => window.open(news.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read More
                        </Button>
                      ) : (
                        <Button variant="gradient" className="w-full">
                          Read Full Article
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center gap-2 mt-12"
              >
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-10"
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default News;