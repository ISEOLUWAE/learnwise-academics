import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ExternalLink, Search, Filter, GraduationCap, Globe, DollarSign } from "lucide-react";

const scholarshipData = [
  {
    id: 1,
    title: "Federal Government Undergraduate Scholarship",
    provider: "Federal Ministry of Education",
    type: "Government",
    level: "Undergraduate",
    amount: "Full Tuition + Stipend",
    deadline: "2024-04-30",
    requirements: ["Nigerian citizenship", "Minimum CGPA of 3.5", "Financial need documentation"],
    description: "Comprehensive scholarship covering tuition fees, accommodation, and monthly stipends for outstanding Nigerian students.",
    applyLink: "https://scholarships.gov.ng/undergraduate",
    isActive: true
  },
  {
    id: 2,
    title: "Shell Nigeria University Scholarship",
    provider: "Shell Petroleum Development Company",
    type: "Corporate",
    level: "Undergraduate",
    amount: "₦500,000 per year",
    deadline: "2024-05-15",
    requirements: ["Study in Engineering/Sciences", "Minimum CGPA of 3.0", "Community service record"],
    description: "Merit-based scholarship for students pursuing engineering and science disciplines.",
    applyLink: "https://shell.com.ng/scholarships",
    isActive: true
  },
  {
    id: 3,
    title: "MTN Foundation Science & Technology Scholarship",
    provider: "MTN Foundation",
    type: "Corporate",
    level: "Undergraduate",
    amount: "₦200,000 per year",
    deadline: "2024-03-20",
    requirements: ["Science/Technology field", "Excellent academic record", "Leadership qualities"],
    description: "Supporting students in STEM fields to drive technological innovation in Nigeria.",
    applyLink: "https://mtnonline.com/foundation/scholarships",
    isActive: false
  },
  {
    id: 4,
    title: "British Council GREAT Scholarships",
    provider: "British Council",
    type: "International",
    level: "Postgraduate",
    amount: "£10,000",
    deadline: "2024-06-30",
    requirements: ["UK university admission", "Nigerian citizenship", "Academic excellence"],
    description: "Scholarships for Nigerian students pursuing postgraduate studies in the UK.",
    applyLink: "https://study-uk.britishcouncil.org/scholarships",
    isActive: true
  }
];

const Scholarships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const filteredScholarships = scholarshipData.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || scholarship.type === selectedType;
    const matchesLevel = !selectedLevel || scholarship.level === selectedLevel;
    const matchesStatus = !showActiveOnly || scholarship.isActive;
    
    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Government": return "bg-brand-blue/20 text-brand-blue border-brand-blue";
      case "Corporate": return "bg-brand-green/20 text-brand-green border-brand-green";
      case "International": return "bg-brand-orange/20 text-brand-orange border-brand-orange";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Government": return <GraduationCap className="h-4 w-4" />;
      case "Corporate": return <DollarSign className="h-4 w-4" />;
      case "International": return <Globe className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
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
                <span className="hero-text">Scholarship</span> Opportunities
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover funding opportunities to support your educational journey and achieve your academic goals
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Scholarships
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search scholarships..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-bg-primary/50"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-bg-primary/50">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="bg-bg-primary/50">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={showActiveOnly ? "default" : "outline"}
                      onClick={() => setShowActiveOnly(!showActiveOnly)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Active Only
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Found {filteredScholarships.length} scholarships
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Scholarships Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredScholarships.map((scholarship, index) => (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full ${!scholarship.isActive ? 'opacity-75' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className={getTypeColor(scholarship.type)}
                        >
                          {getTypeIcon(scholarship.type)}
                          {scholarship.type}
                        </Badge>
                        <Badge variant={scholarship.isActive ? "default" : "secondary"}>
                          {scholarship.isActive ? "Active" : "Closed"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{scholarship.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        {scholarship.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Level:</span>
                          <p className="text-muted-foreground">{scholarship.level}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p className="text-muted-foreground">{scholarship.amount}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Deadline:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={isDeadlinePassed(scholarship.deadline) ? 'text-red-500' : 'text-muted-foreground'}>
                            {new Date(scholarship.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Requirements:</span>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                          {scholarship.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        variant="gradient" 
                        className="w-full"
                        onClick={() => window.open(scholarship.applyLink, '_blank')}
                        disabled={!scholarship.isActive}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {scholarship.isActive ? 'Apply Now' : 'Application Closed'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Need Help with Applications?</h2>
              <p className="text-muted-foreground mb-6">
                Our team can help you prepare winning scholarship applications and essays.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" size="lg">
                  Application Tips
                </Button>
                <Button variant="gradient" size="lg">
                  Get Support
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Scholarships;