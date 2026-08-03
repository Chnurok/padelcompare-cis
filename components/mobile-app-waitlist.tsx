"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

export function MobileAppWaitlist() {
  const [state, setState] = useState<FormState>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        contact: form.get("contact"),
        intent: "android_early_access",
        sourcePage: "/app",
        notes: "Хочет получить ссылку на Android-тест PadelCompare",
        compareIds: []
      })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    event.currentTarget.reset();
    setState("sent");
  }

  return (
    <form className="mobile-waitlist" onSubmit={submit}>
      <label className="field">
        <span>Имя</span>
        <input name="name" minLength={2} maxLength={80} autoComplete="name" required />
      </label>
      <label className="field">
        <span>Email или Telegram</span>
        <input
          name="contact"
          minLength={3}
          maxLength={120}
          placeholder="name@example.com или @username"
          autoComplete="email"
          required
        />
      </label>
      <button className="button button-primary" type="submit" disabled={state === "sending" || state === "sent"}>
        {state === "sending" ? "Отправляем…" : state === "sent" ? "Вы в списке" : "Получить Android-тест"}
      </button>
      <p className={`form-state${state === "error" ? " form-state--error" : ""}`} aria-live="polite">
        {state === "sent"
          ? "Готово. Отправим ссылку, когда тестирование в Google Play откроется."
          : state === "error"
            ? "Не удалось отправить. Попробуйте ещё раз чуть позже."
            : "Только ссылка на тест и важные обновления релиза — без спама."}
      </p>
    </form>
  );
}
