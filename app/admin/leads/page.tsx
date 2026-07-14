import type { Metadata } from "next";
import Link from "next/link";

import { AdminLeadsInbox } from "@/components/admin-leads-inbox";
import { getLeadInboxFromDb } from "@/lib/admin/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin leads",
  description: "Внутренний inbox для product leads из finder и других buyer entrypoints."
};

export default async function AdminLeadsPage() {
  const leads = await getLeadInboxFromDb();

  return (
    <main className="page-shell">
      <nav className="compare-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Rackets</Link>
        <span>/</span>
        <span>Admin</span>
        <span>/</span>
        <span>Leads</span>
      </nav>

      <section className="hero-card compare-hero">
        <div>
          <p className="eyebrow">Commercial ops</p>
          <h1>Lead inbox</h1>
          <p className="hero-text">
            Внутренний экран для входящих запросов из product flow: кто пришёл, какой intent у него был и какие модели попали в shortlist.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <span>Всего лидов</span>
            <strong>{leads.length}</strong>
          </div>
          <div className="metric-card">
            <span>С best match</span>
            <strong>{leads.filter((lead) => lead.selectedRacket).length}</strong>
          </div>
        </div>
      </section>

      <AdminLeadsInbox leads={leads} />
    </main>
  );
}
