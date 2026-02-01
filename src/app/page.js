import Hero from "@/components/Hero";
import SocialBar from "@/components/SocialBar";
import SideMenu from "@/components/SideMenu";

import About from "@/components/About";

import Preloader from "@/components/Preloader";
import Domain from "@/components/Domain";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import HowItWorks from "@/components/HowItWorks";
import WhyLifeFundies from "@/components/WhyLifeFundies";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";

export default function Home() {;
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <Hero />
      <About />
      <Domain />
    
      <HowItWorks />
      <WhyLifeFundies />
      <Testimonials/>
      <FaqSection />
      <CTA />
   <Footer />
   
    </> 
  );
}
export function AboutPage() {
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <About />
      <Footer />
    </>
  );
}

export function DomainsPage() {
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <Domain />
      <Footer />
    </>
  );
}

export function TestimonialsPage() {
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <Testimonials/>
      <Footer />
    </>
  );
}

export function HowItWorksPage() {
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <HowItWorks />
      <Footer />
    </>
  );
}

export function WhyLifeFundiesPage() {
  return (
    <>
      <Preloader />
      <SocialBar />
      <SideMenu />
      <WhyLifeFundies />
      
      <Footer />
    </>
  );
}
