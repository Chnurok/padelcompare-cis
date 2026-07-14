"use client";

import { useMemo, useState } from "react";

import type { CatalogRacket } from "@/lib/catalog/catalog-db";
import { buildCompareHref } from "@/lib/catalog/links";

type Props = {
  current: CatalogRacket;
  candidates: CatalogRacket[];
};

const MAX_COMPARE = 4;

export function RacketDetailCompare({ current, candidates }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([current.id]);
  const isCompareReady = selectedIds.length >= 2;
  const compareHref = useMemo(() => buildCompareHref(selectedIds), [selectedIds]);

  function toggle(id: string) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(id)) {
        if (id === current.id) return currentIds;
        return currentIds.filter((item) => item !== id);
      }

      if (currentIds.length >= MAX_COMPARE) {
        return [current.id, ...currentIds.filter((item) => item !== current.id).slice(1), id];
      }

      return [...currentIds, id];
    });
  }

  return (
    <section className="card detail-compare-card">
      <div className="detail-compare-head">
        <div>
          <p className="eyebrow">Build compare</p>
          <h2>Добавь ещё модели к этой ракетке</h2>
          <p className="panel-text">
            Текущая модель уже закреплена. Добавь ещё 1-3 варианта и открой compare сразу отсюда.
          </p>
        </div>
        {compareHref ? (
          <a href={compareHref} className="button button-primary">
            Сравнить {selectedIds.length} модели
          </a>
        ) : (
          <button type="button" className="button button-primary is-disabled" disabled>
            Сравнить {selectedIds.length} модели
          </button>
        )}
      </div>

      <p className="form-state">
        {isCompareReady
          ? "Compare screen уже готов: откроется с текущим набором моделей."
          : "Текущая ракетка уже закреплена. Добавь ещё хотя бы одну модель."}
      </p>

      <div className="detail-compare-options">
        {[current, ...candidates].map((racket) => {
          const selected = selectedIds.includes(racket.id);
          const locked = racket.id === current.id;

          return (
            <button
              key={racket.id}
              type="button"
              className={`detail-compare-option${selected ? " is-selected" : ""}`}
              onClick={() => toggle(racket.id)}
            >
              <span className="detail-compare-model">{racket.brand} {racket.model}</span>
              <span className="detail-compare-meta">
                {racket.shape} · {racket.playStyle} · €{racket.currentPrice}
              </span>
              <strong>{locked ? "Base model" : selected ? "Added" : "Add to compare"}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
