"use client";

import { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMapPin, FiNavigation, FiSearch } from "react-icons/fi";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export interface LocationSelection extends SelectedCity {
  city: string;
  region: string;
  country: string;
  utcOffset: number;
}

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: LocationSelection;
  onSelect: (location?: LocationSelection) => void;
}

function estimateUtcOffset(longitude: number) {
  return Math.max(-12, Math.min(14, Math.round(longitude / 15)));
}

function normalizeResult(result: NominatimResult): LocationSelection {
  const address = result.address ?? {};
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    result.display_name.split(",")[0]?.trim() ??
    "Local";
  const region = address.state ?? address.county ?? "";
  const country = address.country ?? "";
  const latitude = Number.parseFloat(result.lat);
  const longitude = Number.parseFloat(result.lon);
  const label = [city, region, country].filter(Boolean).join(", ");

  return {
    name: label || result.display_name,
    city,
    region,
    country,
    latitude,
    longitude,
    utcOffset: estimateUtcOffset(longitude),
  };
}

export default function LocationAutocomplete({
  label = "Cidade",
  placeholder = "cidade, pais...",
  value,
  onSelect,
}: LocationAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<LocationSelection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<LocationSelection | undefined>(value);

  useEffect(() => {
    setQuery(value?.name ?? "");
    setSelected(value);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) {
        return;
      }

      setResults([]);
      setActiveIndex(0);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 3 || selected?.name === trimmed) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/nominatim?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setResults([]);
          setError("Nao consegui buscar essa cidade agora.");
          return;
        }

        const data = (await response.json()) as NominatimResult[];
        const normalized = Array.isArray(data)
          ? data
              .map(normalizeResult)
              .filter(
                (item, index, list) =>
                  Number.isFinite(item.latitude) &&
                  Number.isFinite(item.longitude) &&
                  list.findIndex((candidate) => candidate.name === item.name) === index
              )
          : [];

        setResults(normalized);
        setActiveIndex(0);
        setError(normalized.length ? "" : "Nenhuma cidade encontrada.");
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setResults([]);
        setError("A busca de cidade falhou. Tente de novo.");
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selected]);

  const metaText = useMemo(() => {
    if (!selected) {
      return null;
    }

    const utcLabel =
      selected.utcOffset >= 0 ? `UTC+${selected.utcOffset}` : `UTC${selected.utcOffset}`;

    return `${selected.latitude.toFixed(4)} | ${selected.longitude.toFixed(4)} | ${utcLabel} estimado`;
  }, [selected]);

  function chooseLocation(location: LocationSelection) {
    setSelected(location);
    setQuery(location.name ?? "");
    setResults([]);
    setActiveIndex(0);
    setError("");
    onSelect(location);
  }

  function handleQueryChange(nextValue: string) {
    setQuery(nextValue);
    setSelected(undefined);
    onSelect(undefined);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-100/70">
          <FiMapPin />
          {label}
        </span>
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-100/40" />
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (!results.length) {
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % results.length);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => (current - 1 + results.length) % results.length);
              }

              if (event.key === "Enter") {
                event.preventDefault();
                chooseLocation(results[activeIndex]);
              }

              if (event.key === "Escape") {
                setResults([]);
              }
            }}
            placeholder={placeholder}
            className="bazi-input pl-10"
            autoComplete="off"
          />
        </div>
      </label>

      <div className="mt-2 flex min-h-5 items-center text-[0.72rem] text-amber-100/55">
        {loading ? "Buscando local..." : error || metaText}
      </div>

      {results.length ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-amber-200/18 bg-[#0f1531] shadow-[0_28px_60px_rgba(0,0,0,0.42)]">
          {results.map((result, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${result.name}-${result.latitude}-${result.longitude}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  chooseLocation(result);
                }}
                className={`flex w-full items-start gap-3 border-b border-amber-200/10 px-3 py-3 text-left transition last:border-b-0 ${
                  isActive ? "bg-white/[0.05]" : "bg-transparent hover:bg-white/[0.04]"
                }`}
              >
                <span className="mt-0.5 rounded-full bg-amber-200/10 p-2 text-amber-100/80">
                  <FiNavigation />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-amber-50">
                    {result.city}
                  </span>
                  <span className="mt-0.5 block text-xs text-amber-100/55">
                    {[result.region, result.country].filter(Boolean).join(" | ")}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="px-3 py-2 text-right text-[0.65rem] font-medium uppercase tracking-[0.16em] text-amber-100/35">
            OpenStreetMap / Nominatim
          </div>
        </div>
      ) : null}
    </div>
  );
}
