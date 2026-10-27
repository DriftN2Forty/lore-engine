import type { Metadata } from "next";
import "./style.css";
export const metadata: Metadata = { title: "LoreEngine · local author test", description: "Private local RVN chapter chat experiment" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
