#!/usr/bin/env node

/**
 * Release-only runtime gate for the exact JavaScript/WASM path used by MathAstro.
 *
 * This is intentionally separate from verify:natal:all so the offline source/oracle
 * suite remains runnable in constrained audit environments without node_modules.
 * A production release must run this gate after `npm install` and before `next build`.
 */

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const MIN_SWISSEPH_BROWSER = [1, 3, 1];
const EXPECTED_VENDOR_WASM_SHA256 = "7221ce6a3fa85eb894433067a91057cad31e5587e27d471b033519b55628b5b6";

// Independent PySwissEph oracle fixtures already used by verify_eclipse_physical_classifier.py.
const FIXTURES = {
  solar: {
    syzygy: 2452081.99847001,
    expectedMaximum: 2452082.00259432,
    beginField: "partialBegin",
    endField: "partialEnd",
  },
  lunar: {
    syzygy: 2452096.12759520,
    expectedMaximum: 2452096.12169105,
    beginField: "penumbralBegin",
    endField: "penumbralEnd",
  },
  ordinaryFullMoon: {
    syzygy: 2452007.64020917,
  },
};

function fail(message, details = undefined) {
  console.error(`SWISSEPH_RUNTIME=FAIL | ${message}`);
  if (details !== undefined) console.error(details);
  process.exit(1);
}

function parseVersion(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function versionAtLeast(actual, minimum) {
  for (let i = 0; i < 3; i += 1) {
    if (actual[i] > minimum[i]) return true;
    if (actual[i] < minimum[i]) return false;
  }
  return true;
}

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function eclipseContainsSyzygy(eclipse, syzygy, beginField, endField) {
  const begin = eclipse?.[beginField];
  const end = eclipse?.[endField];
  return finitePositive(begin) && finitePositive(end)
    && syzygy >= begin - 1e-7
    && syzygy <= end + 1e-7;
}

async function loadPackageVersion() {
  const packagePath = path.join(process.cwd(), "node_modules", "@swisseph", "browser", "package.json");
  try {
    const raw = await readFile(packagePath, "utf8");
    return JSON.parse(raw).version;
  } catch (error) {
    console.error("SWISSEPH_RUNTIME=DEPENDENCY_MISSING | @swisseph/browser is not installed locally.");
    console.error("Run `npm install` in a networked release environment, then rerun `npm run verify:natal:swisseph-runtime`.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}

async function main() {
  const packageVersion = await loadPackageVersion();
  const parsedVersion = parseVersion(packageVersion);
  if (!parsedVersion || !versionAtLeast(parsedVersion, MIN_SWISSEPH_BROWSER)) {
    fail(`@swisseph/browser ${packageVersion} is below required 1.3.1`);
  }

  let SwissEphemeris;
  try {
    ({ SwissEphemeris } = await import("@swisseph/browser"));
  } catch (error) {
    fail("could not import @swisseph/browser", error instanceof Error ? error.stack : String(error));
  }
  if (typeof SwissEphemeris !== "function") fail("SwissEphemeris named export is unavailable");

  const wasmPath = path.join(process.cwd(), "public", "vendor", "swisseph.wasm");
  let wasmBytes;
  try {
    wasmBytes = await readFile(wasmPath);
  } catch (error) {
    fail(`vendored WASM is missing: ${wasmPath}`, error instanceof Error ? error.message : String(error));
  }

  const wasmSha256 = createHash("sha256").update(wasmBytes).digest("hex");
  if (wasmSha256 !== EXPECTED_VENDOR_WASM_SHA256) {
    fail(
      "vendored swisseph.wasm changed without updating the release fingerprint",
      `expected=${EXPECTED_VENDOR_WASM_SHA256}\nactual=${wasmSha256}`,
    );
  }

  const swe = new SwissEphemeris();
  const wasmDataUrl = `data:application/wasm;base64,${wasmBytes.toString("base64")}`;
  try {
    await swe.init(wasmDataUrl);
  } catch (error) {
    fail("SwissEphemeris failed to initialize with public/vendor/swisseph.wasm", error instanceof Error ? error.stack : String(error));
  }

  for (const method of ["findNextSolarEclipse", "findNextLunarEclipse"]) {
    if (typeof swe[method] !== "function") fail(`${method} is unavailable at runtime`);
  }

  let solar;
  let lunar;
  let ordinaryCandidate;
  try {
    solar = swe.findNextSolarEclipse(FIXTURES.solar.syzygy - 1);
    lunar = swe.findNextLunarEclipse(FIXTURES.lunar.syzygy - 1);
    ordinaryCandidate = swe.findNextLunarEclipse(FIXTURES.ordinaryFullMoon.syzygy - 1);
  } catch (error) {
    fail("Swiss Ephemeris eclipse search threw at runtime", error instanceof Error ? error.stack : String(error));
  }

  if (!Number.isFinite(solar?.maximum)) fail("solar eclipse result has no finite maximum", solar);
  if (!Number.isFinite(lunar?.maximum)) fail("lunar eclipse result has no finite maximum", lunar);

  if (Math.abs(solar.maximum - FIXTURES.solar.expectedMaximum) > 0.02) {
    fail(`solar eclipse maximum drifted: ${solar.maximum}`);
  }
  if (Math.abs(lunar.maximum - FIXTURES.lunar.expectedMaximum) > 0.02) {
    fail(`lunar eclipse maximum drifted: ${lunar.maximum}`);
  }

  if (!eclipseContainsSyzygy(solar, FIXTURES.solar.syzygy, FIXTURES.solar.beginField, FIXTURES.solar.endField)) {
    fail("known solar-eclipse syzygy is outside the returned physical contact interval", solar);
  }
  if (!eclipseContainsSyzygy(lunar, FIXTURES.lunar.syzygy, FIXTURES.lunar.beginField, FIXTURES.lunar.endField)) {
    fail("known lunar-eclipse syzygy is outside the returned physical contact interval", lunar);
  }

  const ordinaryIsEclipse = eclipseContainsSyzygy(
    ordinaryCandidate,
    FIXTURES.ordinaryFullMoon.syzygy,
    "penumbralBegin",
    "penumbralEnd",
  );
  if (ordinaryIsEclipse) {
    fail("ordinary full moon was incorrectly accepted as a physical lunar eclipse", ordinaryCandidate);
  }

  console.log(`SWISSEPH_RUNTIME=PASS | package=${packageVersion} | wasm_sha256=${wasmSha256}`);
  console.log(`SOLAR_ECLIPSE_RUNTIME=PASS | maximum=${solar.maximum} | interval=[${solar.partialBegin}, ${solar.partialEnd}] | type=${solar.type}`);
  console.log(`LUNAR_ECLIPSE_RUNTIME=PASS | maximum=${lunar.maximum} | interval=[${lunar.penumbralBegin}, ${lunar.penumbralEnd}] | type=${lunar.type}`);
  console.log(`ORDINARY_FULL_MOON_RUNTIME=PASS | syzygy=${FIXTURES.ordinaryFullMoon.syzygy}`);
}

main().catch((error) => fail("unexpected runtime-gate error", error instanceof Error ? error.stack : String(error)));
