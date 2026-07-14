import Link from "next/link";

import type { LeadInboxItem } from "@/lib/admin/leads";

type Props = {
  leads: LeadInboxItem[];
};

function formatDate(value: string) {
  return new Date(value).toISOString().slice(0, 16).replace("T", " ");
}

export function AdminLeadsInbox({ leads }: Props) {
  if (leads.length === 0) {
    return (
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Lead inbox</p>
            <h2>Пока пусто</h2>
            <p className="panel-text">Как только пользователь оставит запрос из finder или других entrypoints, он появится здесь.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Lead inbox</p>
          <h2>Новые запросы из product flow</h2>
          <p className="panel-text">Здесь видны контакт, intent, базовая заметка и связанные модели из shortlist.</p>
        </div>
      </div>

      <div className="detail-related-grid">
        {leads.map((lead) => (
          <article key={lead.id} className="detail-related-item admin-lead-card">
            <div className="detail-related-copy">
              <p>{lead.intent}</p>
              <h3>{lead.name}</h3>
              <span>{lead.contact}</span>
            </div>

            <div className="bullet-grid admin-lead-grid">
              <div>
                <strong>{formatDate(lead.createdAt)}</strong>
                <span>created at</span>
              </div>
              <div>
                <strong>{lead.compareRackets.length}</strong>
                <span>shortlist items</span>
              </div>
            </div>

            {lead.selectedRacket ? (
              <p className="panel-text">
                Best match:{" "}
                <Link href={`/rackets/${lead.selectedRacket.id}`} className="text-link">
                  {lead.selectedRacket.fullName}
                </Link>
              </p>
            ) : null}

            {lead.compareRackets.length > 0 ? (
              <ul className="detail-list">
                {lead.compareRackets.map((racket) => (
                  <li key={`${lead.id}-${racket.id}`}>
                    <Link href={`/rackets/${racket.id}`}>{racket.fullName}</Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {lead.notes ? <p className="panel-text">{lead.notes}</p> : null}

            <div className="detail-related-actions">
              {lead.compareRackets.length >= 2 ? (
                <Link href={`/compare?ids=${lead.compareRackets.map((item) => item.id).join(",")}`} className="button button-primary">
                  Открыть compare
                </Link>
              ) : lead.selectedRacket ? (
                <Link href={`/rackets/${lead.selectedRacket.id}`} className="button button-primary">
                  Открыть best match
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
