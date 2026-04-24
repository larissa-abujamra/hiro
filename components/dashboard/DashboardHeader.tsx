import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

interface DashboardHeaderProps {
  serverName: string;
  serverSexo: string;
}

export function DashboardHeader({ serverName, serverSexo }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <DashboardGreeting serverName={serverName} serverSexo={serverSexo} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/consulta/nova"
          prefetch={false}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2d5a47] px-5 py-2.5 text-[13px] font-medium text-[#f5f0e8] transition-all duration-200 hover:opacity-90 active:scale-[0.98] md:flex-none"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nova consulta
        </Link>
        <Link
          href="/agenda"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/60 px-5 py-2.5 text-[13px] font-medium text-[#1c2b1e] backdrop-blur-md transition-colors hover:bg-white/80 md:flex-none"
        >
          <Calendar className="h-4 w-4" strokeWidth={1.75} />
          Agendar
        </Link>
      </div>
    </header>
  );
}
