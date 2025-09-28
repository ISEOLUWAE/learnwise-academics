import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I access course materials?",
    answer: "Once you're logged in, navigate to the specific course page where you'll find all materials including lecture notes, videos, textbooks, and past questions organized by sections."
  },
  {
    question: "How does the GPA calculator work?",
    answer: "Our GPA calculator uses the standard Nigerian university grading system. Enter your course units and scores, and it automatically calculates your GPA and classification based on the 5-point scale."
  },
  {
    question: "Can I download course materials?",
    answer: "Yes! Most course materials including textbooks, lecture notes, and past questions are available for download. Some materials may require you to be logged in to access."
  },
  {
    question: "How do I participate in course quizzes?",
    answer: "Access the Quiz section of any course you're enrolled in. Quizzes are available 24/7, and your scores will appear on the course leaderboard if you perform well."
  },
  {
    question: "Is there a mobile app available?",
    answer: "Currently, AcadBridge is a web-based platform optimized for all devices. Our responsive design ensures you have a great experience on mobile, tablet, and desktop."
  },
  {
    question: "How can I get help with course content?",
    answer: "Each course has a Community section where you can ask questions, share files, and interact with other students. You can also use our AI assistant for instant help with course-related questions."
  },
  {
    question: "Are the courses accredited?",
    answer: "Our courses are designed to complement your university curriculum. They follow standard academic guidelines and can help you excel in your formal education."
  },
  {
    question: "How often is content updated?",
    answer: "We regularly update course materials, add new past questions, and refresh content to ensure accuracy and relevance. News and scholarship information is updated daily."
  }
];

const FAQ = () => {
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
            Frequently Asked <span className="hero-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about AcadBridge and how to make the most of our platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-bg-secondary/50 backdrop-blur border border-white/10 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline hover:text-brand-blue transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;