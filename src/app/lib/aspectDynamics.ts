import { AspectType, ElementType } from "@/interfaces/AstroChartInterfaces";
import { PlanetType } from "@/interfaces/BirthChartInterfaces";

export interface TraditionalAspectParticipant {
  longitude: number;
  speed?: number;
  elementType: ElementType;
  planetType?: PlanetType;
  isAntiscion?: boolean;
}

export interface TraditionalAspectMatch {
  aspectType: AspectType;
  aspectAngle: number;
  orbDistance: number;
  maxOrb: number;
  applying: boolean;
}

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export const TRADITIONAL_FIXED_ORB_DEGREES = 3;

const OUTER_PLANETS = new Set<PlanetType>(["uranus", "neptune", "pluto"]);
const NODES = new Set<PlanetType>(["northNode", "southNode"]);

export function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function getAbsoluteAngularDistance(
  firstLongitude: number,
  secondLongitude: number
): number {
  const difference = Math.abs(
    normalizeLongitude(firstLongitude) - normalizeLongitude(secondLongitude)
  );

  return difference > 180 ? 360 - difference : difference;
}

export function getAspectAngleFromType(aspectType: AspectType): number {
  return ASPECT_ANGLES[aspectType];
}

export function getSignIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

export function getDegreeInSign(longitude: number): number {
  return normalizeLongitude(longitude) % 30;
}

export function getSignDistance(
  firstLongitude: number,
  secondLongitude: number
): number {
  return (
    (getSignIndex(secondLongitude) - getSignIndex(firstLongitude) + 12) % 12
  );
}

export function getAspectTypeFromSigns(
  firstLongitude: number,
  secondLongitude: number
): AspectType | undefined {
  const signDistance = getSignDistance(firstLongitude, secondLongitude);

  if (signDistance === 0) return "conjunction";
  if (signDistance === 2 || signDistance === 10) return "sextile";
  if (signDistance === 3 || signDistance === 9) return "square";
  if (signDistance === 4 || signDistance === 8) return "trine";
  if (signDistance === 6) return "opposition";

  return undefined;
}

export function getAspectOrbFromLongitudes(
  firstLongitude: number,
  secondLongitude: number,
  aspectAngle: number
): number {
  return Math.abs(
    getAbsoluteAngularDistance(firstLongitude, secondLongitude) - aspectAngle
  );
}

export function getTraditionalAspectOrbFromLongitudes(
  firstLongitude: number,
  secondLongitude: number,
  aspectType: AspectType
): number {
  return Math.abs(
    getAbsoluteAngularDistance(firstLongitude, secondLongitude) -
      getAspectAngleFromType(aspectType)
  );
}

function isOuterPlanetOrNode(planetType?: PlanetType): boolean {
  if (!planetType) {
    return false;
  }

  return OUTER_PLANETS.has(planetType) || NODES.has(planetType);
}

function participantSupportsAspect(
  participant: TraditionalAspectParticipant,
  aspectType: AspectType
): boolean {
  if (participant.elementType === "fixedStar") {
    return aspectType === "conjunction";
  }

  if (
    participant.elementType === "house" ||
    participant.elementType === "arabicPart"
  ) {
    return aspectType === "conjunction" || aspectType === "opposition";
  }

  if (participant.isAntiscion) {
    return aspectType === "conjunction" || aspectType === "opposition";
  }

  if (
    participant.elementType === "planet" &&
    isOuterPlanetOrNode(participant.planetType)
  ) {
    return aspectType === "conjunction" || aspectType === "opposition";
  }

  return true;
}

export function getTraditionalAspectMaxOrb(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant,
  aspectType: AspectType
): number {
  void firstParticipant;
  void secondParticipant;
  void aspectType;
  return TRADITIONAL_FIXED_ORB_DEGREES;
}

function buildTraditionalAspectMatch(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant,
  aspectType: AspectType
): TraditionalAspectMatch | null {
  if (
    !participantSupportsAspect(firstParticipant, aspectType) ||
    !participantSupportsAspect(secondParticipant, aspectType)
  ) {
    return null;
  }

  const orbDistance = getTraditionalAspectOrbFromLongitudes(
    firstParticipant.longitude,
    secondParticipant.longitude,
    aspectType
  );
  const maxOrb = getTraditionalAspectMaxOrb(
    firstParticipant,
    secondParticipant,
    aspectType
  );

  if (orbDistance > maxOrb) {
    return null;
  }

  const aspectAngle = getAspectAngleFromType(aspectType);

  return {
    aspectType,
    aspectAngle,
    orbDistance,
    maxOrb,
    applying: isApplyingByMotion({
      firstLongitude: firstParticipant.longitude,
      firstSpeed: firstParticipant.speed ?? 0,
      secondLongitude: secondParticipant.longitude,
      secondSpeed: secondParticipant.speed ?? 0,
      aspectAngle,
    }),
  };
}

export function resolveTraditionalAspect(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant
): TraditionalAspectMatch | null {
  const candidates: TraditionalAspectMatch[] = [];
  const aspectTypes = Object.keys(ASPECT_ANGLES) as AspectType[];

  aspectTypes.forEach((aspectType) => {
    const aspectMatch = buildTraditionalAspectMatch(
      firstParticipant,
      secondParticipant,
      aspectType
    );

    if (aspectMatch) {
      candidates.push(aspectMatch);
    }
  });

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((firstCandidate, secondCandidate) => {
    if (firstCandidate.orbDistance !== secondCandidate.orbDistance) {
      return firstCandidate.orbDistance - secondCandidate.orbDistance;
    }

    return firstCandidate.aspectAngle - secondCandidate.aspectAngle;
  });

  return candidates[0] ?? null;
}

export function isApplyingByMotion(options: {
  firstLongitude: number;
  firstSpeed?: number;
  secondLongitude: number;
  secondSpeed?: number;
  aspectAngle: number;
  timeStep?: number;
}): boolean {
  const {
    firstLongitude,
    firstSpeed = 0,
    secondLongitude,
    secondSpeed = 0,
    aspectAngle,
    timeStep = 1,
  } = options;

  const currentOrb = getAspectOrbFromLongitudes(
    firstLongitude,
    secondLongitude,
    aspectAngle
  );

  const futureOrb = getAspectOrbFromLongitudes(
    firstLongitude + firstSpeed * timeStep,
    secondLongitude + secondSpeed * timeStep,
    aspectAngle
  );

  return futureOrb < currentOrb;
}
