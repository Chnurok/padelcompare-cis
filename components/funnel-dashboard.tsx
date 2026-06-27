import type { FunnelDashboard } from "@/lib/analytics-dashboard";

type Props = {
  data: FunnelDashboard;
};

export function FunnelDashboard({ data }: Props) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Analytics v2</p>
          <h2>Funnel breakdown</h2>
          <p className="panel-text">
            Уже видно не только сырые события, а как пользователь проходит путь от входа к compare, offer и lead.
          </p>
        </div>
      </div>

      <div className="detail-related-grid">
        <article className="detail-list-card">
          <p className="eyebrow">Core funnel</p>
          <h3>Stage counts</h3>
          <ul className="detail-list">
            {data.funnel.map((item) => (
              <li key={item.label}>
                {item.label} · {item.value}
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-list-card">
          <p className="eyebrow">Behavior</p>
          <h3>Compare actions</h3>
          <ul className="detail-list">
            <li>Compare CTA clicks · {data.compareCtaClicks}</li>
            <li>Compare link copies · {data.compareLinkCopies}</li>
          </ul>
        </article>

        <article className="detail-list-card">
          <p className="eyebrow">Top sources</p>
          <h3>Where intent comes from</h3>
          <ul className="detail-list">
            {data.bySource.map((item) => (
              <li key={item.label}>
                {item.label} · {item.value}
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-list-card">
          <p className="eyebrow">Top intents</p>
          <h3>What users are trying to do</h3>
          <ul className="detail-list">
            {data.byIntent.map((item) => (
              <li key={item.label}>
                {item.label} · {item.value}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
