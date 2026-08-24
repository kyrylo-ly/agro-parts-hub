"use server";

export async function searchCities(query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  if (!apiKey) {
    console.error("NOVA_POSHTA_API_KEY is not set.");
    return [];
  }

  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "searchSettlements",
        methodProperties: {
          CityName: query,
          Limit: "15",
          Page: "1"
        }
      })
    });

    const data = await response.json();
    if (data.success && data.data && data.data.length > 0 && data.data[0].Addresses) {
      return data.data[0].Addresses.map((addr: any) => addr.Present);
    }
    return [];
  } catch (error) {
    console.error("Error fetching cities from Nova Poshta:", error);
    return [];
  }
}

export async function searchWarehouses(cityPresentString: string, query: string) {
  if (!cityPresentString) return [];

  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  if (!apiKey) {
    console.error("NOVA_POSHTA_API_KEY is not set.");
    return [];
  }

  // cityPresentString format is usually "м. Київ, Київська обл."
  // We need just the name "Київ" for getWarehouses API.
  let cityName = cityPresentString.split(",")[0].trim();
  cityName = cityName.replace(/^(м\.|с\.|смт\.|селище|село|місто)\s*/i, "").trim();

  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityName: cityName,
          FindByString: query,
          Limit: "1000",
          Page: "1",
          Language: "UA"
        }
      })
    });

    const data = await response.json();
    if (data.success && data.data) {
      return data.data.map((warehouse: any) => warehouse.Description);
    }
    return [];
  } catch (error) {
    console.error("Error fetching warehouses from Nova Poshta:", error);
    return [];
  }
}

