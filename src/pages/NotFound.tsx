import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { PageLayout } from "@/components/layout/PageLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Icon icon="ph:compass" className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-8">
            This page doesn't exist. Perhaps it's been made private?
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icon icon="ph:house" className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
