export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  // Validate ICAO code
  if (!icao || !/^[A-Z]{4}$/.test(icao)) {
    return new Response(JSON.stringify({ error: "Invalid ICAO code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build URL to call
  const url = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`;

  try {
    // Make API call
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch METAR data");
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch METAR" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}