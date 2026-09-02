import { NextResponse } from "next/server";

type NominatimAddress = Record<string, string | undefined>;
type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  addresstype?: string;
  address?: NominatimAddress;
};

function pickLocality(address: NominatimAddress = {}): string | undefined {
  return address.city || address.town || address.village || address.hamlet || address.suburb || address.neighbourhood;
}

function pickMunicipality(address: NominatimAddress = {}): string | undefined {
  return address.municipality || address.city || address.town || address.village;
}

function classifyPrecision(result: NominatimResult): "exactAddress" | "street" | "locality" | "municipality" | "coordinates" {
  const address = result.address ?? {};
  if (address.house_number && (address.road || address.pedestrian)) return "exactAddress";
  if (address.road || address.pedestrian) return "street";
  if (address.city || address.town || address.village || address.hamlet || address.suburb) return "locality";
  if (address.municipality || address.state) return "municipality";
  return "coordinates";
}

async function resolveTimezone(latitude: number, longitude: number): Promise<string | undefined> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "1",
  });
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      headers: { "User-Agent": "MathAstro/1.0" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) return undefined;
    const data = await response.json() as { timezone?: string };
    return typeof data.timezone === "string" && data.timezone.includes("/") ? data.timezone : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "missing q param" }, { status: 400 });

  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "7",
    dedupe: "1",
  });
  if (process.env.NOMINATIM_EMAIL) params.set("email", process.env.NOMINATIM_EMAIL);

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      "User-Agent": process.env.NOMINATIM_USER_AGENT || `MathAstro/1.0 (${process.env.NOMINATIM_EMAIL || "https://mathastro.vercel.app"})`,
      ...(process.env.NOMINATIM_REFERER ? { Referer: process.env.NOMINATIM_REFERER } : {}),
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "geocoder unavailable", status: response.status }, { status: 502 });
  }

  const raw = await response.json() as NominatimResult[];
  const normalized = await Promise.all(raw.map(async (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    const address = result.address ?? {};
    const timezone = Number.isFinite(latitude) && Number.isFinite(longitude)
      ? await resolveTimezone(latitude, longitude)
      : undefined;
    const sourceId = [result.osm_type, result.osm_id ?? result.place_id].filter(Boolean).join(":");

    return {
      displayName: result.display_name,
      name: result.display_name,
      locality: pickLocality(address),
      municipality: pickMunicipality(address),
      region: address.state || address.region,
      country: address.country,
      countryCode: address.country_code?.toUpperCase(),
      latitude,
      longitude,
      timezone,
      timezoneSource: timezone ? "geocoder" : undefined,
      source: "Nominatim/OpenStreetMap",
      sourceId,
      precision: classifyPrecision(result),
      objectType: result.addresstype || result.type,
    };
  }));

  return NextResponse.json(normalized, {
    headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
  });
}
