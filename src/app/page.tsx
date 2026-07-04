import { ComingSoon } from "@/components/coming-soon";
import { SiteHome } from "@/components/site-home";
import { isLaunched } from "@/lib/flags";

export default function Home() {
  return isLaunched ? <SiteHome /> : <ComingSoon />;
}
