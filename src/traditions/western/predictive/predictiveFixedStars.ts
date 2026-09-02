import { calculateFullFixedStarSky } from "@/app/lib/fixedStars";
import { getSwe } from "@/app/lib/astrologyEngine";
import {
  MARCOS_FIXED_STAR_COMMON_MAX_ORB,
  MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB,
} from "@/traditions/western/natal/natalMethodConstants";
import type { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { circularDistance, signName } from "./predictiveAstronomy";
import type { PredictiveAuthorMode, PredictiveFixedStarContact, PredictivePoint, PredictiveSkySnapshot } from "./predictiveTypes";


export interface PredictiveFixedStarTarget {
  name: string;
  longitude: number;
  magnitude?: number;
  calculationMode: "swiss-exact" | "catalog-precession";
  isMarcosPrincipal: boolean;
  traditionalMetadataAvailable: boolean;
  isAstroSeekMajor15: boolean;
  explicitFrawleyReturnExample: boolean;
}

export async function calculatePredictiveFixedStarTargets(
  birthChart: BirthChart,
  sky: PredictiveSkySnapshot,
): Promise<PredictiveFixedStarTarget[]> {
  const sw = await getSwe();
  const starSky = await calculateFullFixedStarSky(birthChart, sw, sky.julianDayUt);
  const explicitFrawleyReturnStars = new Set(["baten kaitos"]);
  return starSky.positions
    .filter((star) => star.isMarcosPrincipal || star.traditionalMetadataAvailable || star.isAstroSeekMajor15 || explicitFrawleyReturnStars.has(star.name.toLowerCase()))
    .map((star) => ({
      name: star.name,
      longitude: star.longitude,
      magnitude: star.magnitude,
      calculationMode: star.calculationMode,
      isMarcosPrincipal: Boolean(star.isMarcosPrincipal),
      traditionalMetadataAvailable: Boolean(star.traditionalMetadataAvailable),
      isAstroSeekMajor15: Boolean(star.isAstroSeekMajor15),
      explicitFrawleyReturnExample: explicitFrawleyReturnStars.has(star.name.toLowerCase()),
    }));
}

function sameSign(a: number, b: number): boolean {
  return Math.floor((((a % 360) + 360) % 360) / 30) === Math.floor((((b % 360) + 360) % 360) / 30);
}

function marcosOrb(star: { isMarcosPrincipal?: boolean }): number {
  return star.isMarcosPrincipal ? MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB : MARCOS_FIXED_STAR_COMMON_MAX_ORB;
}

export async function calculatePredictiveFixedStarContacts(
  birthChart: BirthChart,
  sky: PredictiveSkySnapshot,
  movingPoints: PredictivePoint[],
  authorMode: PredictiveAuthorMode,
  technique: "progression" | "return" | "transit" = "return",
): Promise<PredictiveFixedStarContact[]> {
  const candidates = await calculatePredictiveFixedStarTargets(birthChart, sky);
  const explicitFrawleyReturnStars = new Set(["baten kaitos"]);
  const includeMarcosRules = authorMode === "marcos" || authorMode === "combined" || authorMode === "integrated";
  const includeFrawley = authorMode === "frawley" || authorMode === "combined" || authorMode === "integrated";

  return movingPoints.flatMap((moving) => candidates.map((star) => {
    const distance = circularDistance(moving.longitude, star.longitude);
    const inSameSign = sameSign(moving.longitude, star.longitude);
    const maxOrbDeg = marcosOrb(star);
    const marcosEligible = includeMarcosRules && inSameSign && distance <= maxOrbDeg;
    const frawleyPrimaryDirector = ["Sol", "Lua", "ASC", "MC", "Parte da Fortuna"].includes(moving.name);
    const frawleyReturnExampleStar = includeFrawley && technique === "return" && explicitFrawleyReturnStars.has(star.name.toLowerCase());
    return {
      moving: moving.name,
      movingKind: moving.kind,
      movingLongitude: moving.longitude,
      movingSign: signName(moving.longitude),
      star: star.name,
      starLongitude: star.longitude,
      starSign: signName(star.longitude),
      magnitude: star.magnitude,
      calculationMode: star.calculationMode,
      sameSign: inSameSign,
      distanceToConjunction: distance,
      maxOrbDeg,
      operationallyActive: marcosEligible,
      sourceIds: [
        ...(marcosEligible ? ["MARCOS_FIXED_STARS_TEMPORAL_COURSE"] : []),
        ...(includeFrawley && technique === "progression" && frawleyPrimaryDirector ? ["FRAWLEY_FIVE_PRIMARY_DIRECTORS"] : []),
        ...(frawleyReturnExampleStar ? ["FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE"] : []),
      ],
      authorEligibility: {
        marcos: marcosEligible ? "SOURCE_LOCKED_CANDIDATE" : "NOT_ACTIVE_BY_MARCOS_SCREEN",
        frawley: !includeFrawley
          ? "NOT_IN_AUTHOR_MODE"
          : technique === "progression" && frawleyPrimaryDirector
            ? "SOURCE_LOCKED_PROGRESSION_TARGET_ORB_UNPUBLISHED"
            : frawleyReturnExampleStar
              ? "SOURCE_LOCKED_RETURN_EXAMPLE_DISTANCE_UNFILTERED"
              : "ASTRONOMY_MATERIALIZED_INTERPRETIVE_RULE_NOT_ASSUMED",
      },
      noStandaloneInterpretation: true,
    } satisfies PredictiveFixedStarContact;
  })).filter((item) => item.distanceToConjunction <= Math.max(MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB, 3) || item.authorEligibility.frawley === "SOURCE_LOCKED_RETURN_EXAMPLE_DISTANCE_UNFILTERED");
}
