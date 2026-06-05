import { rackets } from "../data/rackets.js";

const state = {
  search: "",
  brand: "all",
  shape: "all",
  skill: "all",
  style: "all",
  hardness: "all",
  maxPrice: 450,
  selectedId: rackets[0].id,
  compareIds: []
};

const filters = {
  brand: document.querySelector("#brand-filter"),
  shape: document.querySelector("#shape-filter"),
  skill: document.querySelector("#skill-filter"),
  style: document.querySelector("#style-filter"),
  hardness: document.querySelector("#hardness-filter"),
  price: document.querySelector("#price-filter"),
  search: document.querySelector("#search-input")
};

const nodes = {
  catalogGrid: document.querySelector("#catalog-grid"),
  resultsCount: document.querySelector("#results-count"),
  detailCard: document.querySelector("#detail-card"),
  compareSummary: document.querySelector("#compare-summary"),
  compareTableHead: document.querySelector("#compare-table thead"),
  compareTableBody: document.querySelector("#compare-table tbody"),
  priceLabel: document.querySelector("#price-filter-value"),
  leadResult: document.querySelector("#lead-form-result")
};

const selectConfig = [
  ["brand", "brand"],
  ["shape", "shape"],
  ["skill", "skillLevel"],
  ["style", "playStyle"],
  ["hardness", "hardness"]
];

init();

function init() {
  hydrateCompareFromUrl();
  buildSelects();
  bindEvents();
  render();
}

function hydrateCompareFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const compare = params.get("compare");
  if (!compare) return;

  state.compareIds = compare
    .split(",")
    .map((item) => item.trim())
    .filter((item) => rackets.some((racket) => racket.id === item))
    .slice(0, 4);

  if (state.compareIds[0]) {
    state.selectedId = state.compareIds[0];
  }
}

function buildSelects() {
  selectConfig.forEach(([stateKey, field]) => {
    const values = ["all", ...new Set(rackets.map((racket) => racket[field]))];
    filters[stateKey].innerHTML = values
      .map((value) => `<option value="${value}">${value === "all" ? "Все" : value}</option>`)
      .join("");
  });
}

function bindEvents() {
  filters.search.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  selectConfig.forEach(([stateKey]) => {
    filters[stateKey].addEventListener("change", (event) => {
      state[stateKey] = event.target.value;
      render();
    });
  });

  filters.price.addEventListener("input", (event) => {
    state.maxPrice = Number(event.target.value);
    render();
  });

  document.querySelector("#reset-filters").addEventListener("click", () => {
    state.search = "";
    state.brand = "all";
    state.shape = "all";
    state.skill = "all";
    state.style = "all";
    state.hardness = "all";
    state.maxPrice = 450;
    filters.search.value = "";
    selectConfig.forEach(([stateKey]) => {
      filters[stateKey].value = "all";
    });
    filters.price.value = "450";
    render();
  });

  document.querySelector("#clear-compare").addEventListener("click", () => {
    state.compareIds = [];
    syncUrl();
    render();
  });

  document.querySelector("#copy-compare-link").addEventListener("click", async () => {
    syncUrl();
    try {
      await navigator.clipboard.writeText(window.location.href);
      nodes.compareSummary.textContent = "Ссылка на сравнение скопирована";
      window.setTimeout(renderCompareSummary, 1200);
    } catch {
      nodes.compareSummary.textContent = "Не удалось скопировать, но ссылка уже в URL";
    }
  });

  document.querySelector("#scroll-to-compare").addEventListener("click", () => {
    document.querySelector("#compare").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector("#lead-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(data.entries());
    const context = {
      source: "mini-mvp",
      selected: state.selectedId,
      compareIds: state.compareIds
    };

    nodes.leadResult.textContent =
      "Лид сохранен локально: " + JSON.stringify({ payload, context });
    event.currentTarget.reset();
  });
}

function getFilteredRackets() {
  return rackets.filter((racket) => {
    const matchesSearch =
      !state.search ||
      [racket.brand, racket.model, racket.fullName].join(" ").toLowerCase().includes(state.search);

    return (
      matchesSearch &&
      (state.brand === "all" || racket.brand === state.brand) &&
      (state.shape === "all" || racket.shape === state.shape) &&
      (state.skill === "all" || racket.skillLevel === state.skill) &&
      (state.style === "all" || racket.playStyle === state.style) &&
      (state.hardness === "all" || racket.hardness === state.hardness) &&
      racket.currentPrice <= state.maxPrice
    );
  });
}

function render() {
  const filtered = getFilteredRackets();

  if (!filtered.some((racket) => racket.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? rackets[0].id;
  }

  nodes.priceLabel.textContent = `€${state.maxPrice}`;
  nodes.resultsCount.textContent = `${filtered.length} моделей`;
  renderCatalog(filtered);
  renderDetail();
  renderCompareSummary();
  renderCompareTable();
}

function renderCatalog(list) {
  nodes.catalogGrid.innerHTML = list
    .map((racket) => {
      const inCompare = state.compareIds.includes(racket.id);
      return `
        <article class="racket-card ${state.selectedId === racket.id ? "is-active" : ""}">
          <button class="card-click-area" type="button" data-open="${racket.id}">
            <span class="racket-badge">${racket.image}</span>
            <div class="card-header">
              <p>${racket.brand}</p>
              <h3>${racket.model}</h3>
            </div>
            <p class="card-subtitle">${racket.shape} · ${racket.playStyle} · ${racket.hardness}</p>
            <p class="card-verdict">${racket.verdict}</p>
            <div class="spec-pills">
              <span>${racket.skillLevel}</span>
              <span>${racket.balance} balance</span>
              <span>${racket.weight} g</span>
            </div>
            <div class="price-row">
              <strong>€${racket.currentPrice}</strong>
              <span>${racket.shopName}</span>
            </div>
          </button>
          <div class="card-actions">
            <button class="button button-secondary" type="button" data-compare="${racket.id}">
              ${inCompare ? "Убрать из сравнения" : "Сравнить"}
            </button>
            <a class="text-link" href="${racket.shopUrl}" target="_blank" rel="noreferrer">
              Где купить
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  nodes.catalogGrid.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.open;
      render();
    });
  });

  nodes.catalogGrid.querySelectorAll("[data-compare]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompare(button.dataset.compare);
    });
  });
}

function toggleCompare(id) {
  const hasId = state.compareIds.includes(id);
  if (hasId) {
    state.compareIds = state.compareIds.filter((item) => item !== id);
  } else if (state.compareIds.length < 4) {
    state.compareIds = [...state.compareIds, id];
  }

  syncUrl();
  render();
}

function renderDetail() {
  const racket = rackets.find((item) => item.id === state.selectedId) ?? rackets[0];
  nodes.detailCard.innerHTML = `
    <div class="detail-hero">
      <div class="detail-badge">${racket.image}</div>
      <div>
        <p class="eyebrow">${racket.brand}</p>
        <h3>${racket.fullName}</h3>
        <p class="detail-text">${racket.verdict}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <h4>Кому подходит</h4>
        <p>${racket.whoItFits}</p>
      </div>
      <div>
        <h4>Нормализованные поля</h4>
        <ul class="plain-list">
          <li>Профиль: ${racket.playStyle}</li>
          <li>Жесткость: ${racket.hardness}</li>
          <li>Уровень: ${racket.skillLevel}</li>
          <li>Sweet spot: ${racket.sweetSpot}</li>
        </ul>
      </div>
      <div>
        <h4>Техспеки</h4>
        <ul class="plain-list">
          <li>Форма: ${racket.shape}</li>
          <li>Вес: ${racket.weight} g</li>
          <li>Баланс: ${racket.balance}</li>
          <li>Face: ${racket.faceMaterial}</li>
          <li>Frame: ${racket.frameMaterial}</li>
          <li>Core: ${racket.coreMaterial}</li>
        </ul>
      </div>
      <div>
        <h4>Плюсы / минусы</h4>
        <p><strong>Плюсы:</strong> ${racket.pros.join(", ")}</p>
        <p><strong>Минусы:</strong> ${racket.cons.join(", ")}</p>
      </div>
    </div>
  `;
}

function renderCompareSummary() {
  nodes.compareSummary.textContent = `Выбрано ${state.compareIds.length} из 4 моделей`;
}

function renderCompareTable() {
  const compareRackets = rackets.filter((racket) => state.compareIds.includes(racket.id));
  const fields = [
    ["Бренд", "brand"],
    ["Модель", "model"],
    ["Год", "season"],
    ["Форма", "shape"],
    ["Вес", "weight"],
    ["Баланс", "balance"],
    ["Жесткость", "hardness"],
    ["Face", "faceMaterial"],
    ["Frame", "frameMaterial"],
    ["Core", "coreMaterial"],
    ["Уровень", "skillLevel"],
    ["Профиль", "playStyle"],
    ["Sweet spot", "sweetSpot"],
    ["Цена", "currentPrice"]
  ];

  if (compareRackets.length === 0) {
    nodes.compareTableHead.innerHTML = "";
    nodes.compareTableBody.innerHTML =
      '<tr><td class="empty-state">Добавь 2-4 модели, чтобы увидеть таблицу сравнения.</td></tr>';
    return;
  }

  nodes.compareTableHead.innerHTML = `
    <tr>
      <th>Поле</th>
      ${compareRackets.map((racket) => `<th>${racket.brand}<br />${racket.model}</th>`).join("")}
    </tr>
  `;

  nodes.compareTableBody.innerHTML = fields
    .map(([label, field]) => {
      const values = compareRackets.map((racket) =>
        field === "currentPrice" ? `€${racket[field]}` : racket[field]
      );
      const distinct = new Set(values).size > 1;
      return `
        <tr>
          <td>${label}</td>
          ${values
            .map((value) => `<td class="${distinct ? "is-different" : ""}">${value}</td>`)
            .join("")}
        </tr>
      `;
    })
    .join("");
}

function syncUrl() {
  const url = new URL(window.location.href);
  if (state.compareIds.length > 0) {
    url.searchParams.set("compare", state.compareIds.join(","));
  } else {
    url.searchParams.delete("compare");
  }
  window.history.replaceState({}, "", url);
}
