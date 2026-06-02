import { LandingPage } from "@/components/marketing/LandingPage";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Public-facing landing page (unauthenticated). Authenticated users reach
 * their dashboard via /dashboard which is guarded in the (app) layout.
 */
export default function Home() {
  return (
    <>
      <LandingPage />
      <SiteFooter />
    </>
  );
}
