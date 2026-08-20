import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  const ukrainianToEnglish: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
    з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
    о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia",
    А: "A", Б: "B", В: "V", Г: "H", Ґ: "G", Д: "D", Е: "E", Є: "Ie", Ж: "Zh",
    З: "Z", И: "Y", І: "I", Ї: "I", Й: "I", К: "K", Л: "L", М: "M", Н: "N",
    О: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "Kh", Ц: "Ts",
    Ч: "Ch", Ш: "Sh", Щ: "Shch", Ь: "", Ю: "Iu", Я: "Ia"
  };

  const transliterated = text.split('').map(char => ukrainianToEnglish[char] || char).join('');

  return transliterated
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

export function getSafeCallbackUrl(url?: string, defaultUrl = "/") {
  if (!url) return defaultUrl;

  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return defaultUrl;
}