import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  HelpCircle,
  User
} from "lucide-react";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "info@smartlearn.edu",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      content: "+234 (0) 123 456 789",
      description: "Call us during business hours"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      content: "123 Education Street, Lagos, Nigeria",
      description: "Visit our campus"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Office Hours",
      content: "Mon - Fri: 8AM - 6PM",
      description: "We're here to help"
    }
  ];

  const faqItems = [
    {
      question: "How do I access course materials?",
      answer: "After logging in, navigate to the Courses page and select your desired course to access all materials."
    },
    {
      question: "Can I calculate my GPA on the platform?",
      answer: "Yes! Use our built-in GPA calculator in the Courses section to calculate both GPA and CGPA."
    },
    {
      question: "Are the course materials updated regularly?",
      answer: "Yes, we regularly update our course materials and add new content based on curriculum changes."
    },
    {
      question: "How can I get help with technical issues?",
      answer: "Contact our support team using this form or email us directly at support@smartlearn.edu"
    }
  ];

  return (
    <Layout>
      <div className="pt-20">
        {/* Header Section */}
        <section className="py-12 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="hero-text">Get in Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Send Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="firstName"
                                placeholder="Your first name"
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="lastName"
                                placeholder="Your last name"
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <div className="relative">
                            <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="subject"
                              placeholder="What is this about?"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-[120px]"
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    <div className="grid gap-6">
                      {contactInfo.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <Card className="bg-bg-secondary/30 backdrop-blur border-white/10">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-gradient-primary text-white">
                                  {item.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                  <p className="font-medium mb-1">{item.content}</p>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-bg-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions about SmartLearn
                </p>
              </div>

              <div className="grid gap-6">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;