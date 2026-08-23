export function handleDbError(error: unknown, defaultMessage: string, customMessages?: Record<string, string>) {
  if (error instanceof Error && error.message.includes("unique")) {
    if (error.message.includes("sku")) {
      return { success: false as const, error: customMessages?.sku || "Запис з таким SKU вже існує" };
    }
    if (error.message.includes("slug")) {
      return { success: false as const, error: customMessages?.slug || "Запис з таким slug вже існує" };
    }
    if (error.message.includes("name")) {
      return { success: false as const, error: customMessages?.name || "Запис з такою назвою вже існує" };
    }
    return { success: false as const, error: "Дублювання даних" };
  }
  return { success: false as const, error: defaultMessage };
}
