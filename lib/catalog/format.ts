export function formatShape(value: string) {
  return (
    {
      round: "круглая",
      tear: "капля",
      diamond: "бриллиант"
    }[value] ?? value
  );
}

export function formatPlayStyle(value: string) {
  return (
    {
      balanced: "сбалансированная",
      control: "контроль",
      power: "мощность",
      comfort: "комфорт"
    }[value] ?? value
  );
}

export function formatSkillLevel(value: string) {
  return (
    {
      intermediate: "средний",
      advanced: "продвинутый"
    }[value] ?? value
  );
}

export function formatHardness(value: string) {
  return (
    {
      soft: "мягкая",
      medium: "средняя",
      hard: "жесткая"
    }[value] ?? value
  );
}

export function formatBalance(value: string) {
  return (
    {
      low: "низкий",
      medium: "средний",
      high: "высокий"
    }[value] ?? value
  );
}

export function formatSweetSpot(value: string) {
  return (
    {
      medium: "средняя",
      large: "большая"
    }[value] ?? value
  );
}

export function formatAvailability(value: string) {
  return (
    {
      in_stock: "в наличии",
      limited: "мало в наличии",
      preorder: "предзаказ",
      out_of_stock: "нет в наличии"
    }[value] ?? value.replaceAll("_", " ")
  );
}
