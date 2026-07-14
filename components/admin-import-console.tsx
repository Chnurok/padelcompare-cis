"use client";

import { useState } from "react";

type ImportSummary = {
  dryRun: boolean;
  rackets: number;
  created: number;
  updated: number;
  offers: number;
  brands: number;
  merchants: number;
};

const IMPORT_TEMPLATE = `Offer fields:
- merchant
- url
- currency
- price
- previousPrice (optional)
- availability: in_stock | limited | preorder | out_of_stock
- stockNote (optional)
- lastCheckedAt ISO timestamp (optional)`;

type Props = {
  samplePayload: string;
};

export function AdminImportConsole({ samplePayload }: Props) {
  const [payload, setPayload] = useState(samplePayload);
  const [sourceLabel, setSourceLabel] = useState("Manual admin import");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [message, setMessage] = useState("Вставь JSON-массив с моделями и офферами. Можно сначала сделать dry run.");

  async function runImport(dryRun: boolean) {
    try {
      setState("sending");
      setSummary(null);
      setMessage(dryRun ? "Проверяю payload без записи в базу..." : "Импортирую каталог в Prisma...");

      const items = JSON.parse(payload);
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          dryRun,
          sourceLabel,
          items
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? result.error ?? "Import failed");
      }

      setSummary(result.summary);
      setState("done");
      setMessage(
        result.summary.dryRun
          ? "Dry run прошёл. Структура валидна, можно импортировать в базу."
          : "Импорт завершён. Каталог и офферы обновлены в базе."
      );
    } catch (error) {
      setState("error");
      setSummary(null);
      setMessage(error instanceof Error ? error.message : "Import failed");
    }
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin import</p>
          <h2>Bulk upsert каталога без правки seed</h2>
          <p className="panel-text">
            Сюда можно вставлять JSON-пакет с ракетками и наборами офферов. Сначала проверка, потом запись.
          </p>
        </div>
      </div>

      <label className="field admin-field">
        <span>Source label</span>
        <input
          value={sourceLabel}
          onChange={(event) => setSourceLabel(event.target.value)}
          placeholder="Manual admin import / CSV batch / merchant refresh"
        />
      </label>

      <label className="field admin-field">
        <span>JSON payload</span>
        <textarea
          className="admin-textarea"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          spellCheck={false}
        />
      </label>

      <div className="hero-actions">
        <button
          type="button"
          className="button"
          onClick={() => void runImport(true)}
          disabled={state === "sending"}
        >
          Dry run
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() => void runImport(false)}
          disabled={state === "sending"}
        >
          {state === "sending" ? "Обрабатываю..." : "Импортировать в базу"}
        </button>
      </div>

      <p className="form-state">{message}</p>
      <p className="form-state">{IMPORT_TEMPLATE}</p>

      {summary ? (
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Rackets</span>
            <strong>{summary.rackets}</strong>
          </div>
          <div className="metric-card">
            <span>Created / updated</span>
            <strong>
              {summary.created} / {summary.updated}
            </strong>
          </div>
          <div className="metric-card">
            <span>Offers</span>
            <strong>{summary.offers}</strong>
          </div>
          <div className="metric-card">
            <span>Brands / merchants</span>
            <strong>
              {summary.brands} / {summary.merchants}
            </strong>
          </div>
        </div>
      ) : null}
    </section>
  );
}
