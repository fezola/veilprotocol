import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function PageLayout({ children, hideFooter = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
