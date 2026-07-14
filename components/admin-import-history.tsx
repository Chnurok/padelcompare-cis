import type { ImportRunItem } from "@/lib/admin/import-runs";

type Props = {
  runs: ImportRunItem[];
};

function formatDate(value: string) {
  return new Date(value).toISOString().slice(0, 16).replace("T", " ");
}

export function AdminImportHistory({ runs }: Props) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Import history</p>
          <h2>Последние applied imports</h2>
          <p className="panel-text">
            История успешных записей в каталог: откуда пришёл пакет, какого он был размера и сколько сущностей реально обновил.
          </p>
        </div>
      </div>

      {runs.length === 0 ? (
        <p className="panel-text">Пока нет applied imports. Dry run сюда не записывается.</p>
      ) : (
        <div className="detail-related-grid">
          {runs.map((run) => (
            <article key={run.id} className="detail-related-item admin-lead-card">
              <div className="detail-related-copy">
                <p>{run.sourceLabel ?? "Manual import"}</p>
                <h3>{formatDate(run.createdAt)}</h3>
                <span>{run.rackets} rackets · {run.offers} offers · payload {run.payloadSize} items</span>
              </div>
              <div className="bullet-grid admin-lead-grid">
                <div>
                  <strong>{run.createdCount}</strong>
                  <span>created</span>
                </div>
                <div>
                  <strong>{run.updatedCount}</strong>
                  <span>updated</span>
                </div>
                <div>
                  <strong>{run.brands} / {run.merchants}</strong>
                  <span>brands / merchants</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
