import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import DigitalSkillset from "@/components/home/DigitalSkillset";
import FAQ from "@/components/home/FAQ";
import Testimonials from "@/components/home/Testimonials";
import AnimatedBackground from "@/components/three/AnimatedBackground";

const Index = () => {
  return (
    <Layout>
      <AnimatedBackground />
      <HeroSection />
      <FeaturedCourses />
      <DigitalSkillset />
      <FAQ />
      <Testimonials />
    </Layout>
  );
};

export default Index;
