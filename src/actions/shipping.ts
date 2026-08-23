"use server";

// Mocked data for cities
const MOCK_CITIES = [
  "Київ",
  "Львів",
  "Одеса",
  "Дніпро",
  "Харків",
  "Запоріжжя",
  "Вінниця",
  "Івано-Франківськ",
  "Тернопіль",
  "Хмельницький",
  "Полтава",
  "Черкаси",
  "Житомир",
  "Чернівці",
  "Рівне",
];

// Mocked data for warehouses (branches)
const MOCK_WAREHOUSES = Array.from({ length: 150 }, (_, i) => `Відділення №${i + 1}`);

export async function searchCities(query: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query) {
    return MOCK_CITIES.slice(0, 10);
  }

  const lowerQuery = query.toLowerCase();
  return MOCK_CITIES.filter((city) => city.toLowerCase().includes(lowerQuery));
}

export async function searchWarehouses(city: string, query: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!city) return [];

  // Randomize available warehouses a bit based on city length to make it look "dynamic"
  const availableWarehouses = MOCK_WAREHOUSES.filter((_, i) => i % (city.length % 3 + 1) === 0);

  if (!query) {
    return availableWarehouses.slice(0, 20);
  }

  const lowerQuery = query.toLowerCase();
  return availableWarehouses.filter((w) => w.toLowerCase().includes(lowerQuery));
}
