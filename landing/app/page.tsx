import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import GlobalNetwork from '@/components/GlobalNetwork';
import ProblemSection from '@/components/ProblemSection';
import HowItWorks from '@/components/HowItWorks';
import DashboardPreview from '@/components/DashboardPreview';
import LeadIntelligence from '@/components/LeadIntelligence';
import EmailAutomation from '@/components/EmailAutomation';
import CampaignAnalytics from '@/components/CampaignAnalytics';
import { FeatureGrid, FinalCTA, Footer } from '@/components/FeatureGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <TrustBar />
      <GlobalNetwork />
      <ProblemSection />
      <HowItWorks />
      <DashboardPreview />
      <LeadIntelligence />
      <EmailAutomation />
      <CampaignAnalytics />
      <FeatureGrid />
      <FinalCTA />
      <Footer />
    </main>
  );
}
