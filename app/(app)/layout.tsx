import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import DefaultPasswordBanner from "@/components/auth/default-password-banner";
import SessionGuard from "@/components/auth/session-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SessionGuard />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DefaultPasswordBanner />
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
