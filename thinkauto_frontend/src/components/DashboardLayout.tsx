import { ReactNode } from "react";
import Navigation from "./Navigation";
import BrandLogo from "./BrandLogo";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen gradient-dark overflow-x-hidden">
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-strong border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <BrandLogo size="sm" />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden text-xs font-medium capitalize text-muted-foreground rounded-full bg-secondary px-3 py-1.5 min-[360px]:inline">
                {role}
              </span>
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Page title */}
        <div className="mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6">
          <h1 className="break-words font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>

        {/* Content */}
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-2 sm:px-6 sm:pb-24">
          {children}
        </main>
      </div>

      <Navigation />
    </div>
  );
};

export default DashboardLayout;
