import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import { calculateArudhaSet } from "./arudhaUtils";

const SIGN_NAMES = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrischika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
] as const;

const NATURAL_BENEFICS = new Set(["moon", "mercury", "jupiter", "venus"]);
const SIGN_LORD_KEYS = [
  "mars",
  "venus",
  "mercury",
  "moon",
  "sun",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "saturn",
  "jupiter",
] as const;
const WEEKDAY_PLANET_KEYS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
] as const;

interface PlanetArudhaRow {
  label: string;
  point: VedicPoint;
  lordPoint: VedicPoint;
  arudhaSignIndex: number;
  arudhaSignName: string;
  houseFromLagna: number;
  distance: number;
  adjustmentApplied: boolean;
  touchedAnchors: string[];
  score: number;
  note: string;
}

interface JaiminiAnchorMeshRow {
  label: string;
  signIndex: number;
  signName: string;
  linkedAnchors: string[];
  karakaTouches: string[];
  forceTouches: string[];
  grahaArudhaTouches: string[];
  score: number;
  note: string;
}

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function isMovable(signIndex: number) {
  return [0, 3, 6, 9].includes(signIndex);
}

function isFixed(signIndex: number) {
  return [1, 4, 7, 10].includes(signIndex);
}

function isDual(signIndex: number) {
  return [2, 5, 8, 11].includes(signIndex);
}

function signMode(signIndex: number) {
  if (isMovable(signIndex)) return "movable";
  if (isFixed(signIndex)) return "fixed";
  return "dual";
}

function rashiDrishtiTargets(signIndex: number) {
  if (isMovable(signIndex)) {
    return [1, 4, 7, 10].filter((target) => target !== modulo(signIndex + 1, 12));
  }

  if (isFixed(signIndex)) {
    return [0, 3, 6, 9].filter((target) => target !== modulo(signIndex + 11, 12));
  }

  if (isDual(signIndex)) {
    return [2, 5, 8, 11].filter((target) => target !== signIndex);
  }

  return [];
}

function hasRashiDrishti(fromSignIndex: number, toSignIndex: number) {
  return rashiDrishtiTargets(fromSignIndex).includes(toSignIndex);
}

function findPlanetsInSign(snapshot: VedicSnapshot, signIndex: number) {
  return snapshot.planets.filter((point) => point.signIndex === signIndex);
}

function joinedPlanetNames(points: VedicPoint[]) {
  return points.length ? points.map((point) => point.name).join(", ") : "--";
}

function dignityRank(tags: string[]) {
  if (tags.includes("Exaltado") || tags.includes("Moolatrikona") || tags.includes("Domicilio")) {
    return 3;
  }

  if (tags.includes("Amigavel")) {
    return 2;
  }

  if (tags.includes("Inimigo") || tags.includes("Debilitado") || tags.includes("Combusto")) {
    return 0;
  }

  return 1;
}

function signModeWeight(signIndex: number) {
  if (isMovable(signIndex)) return 3;
  if (isFixed(signIndex)) return 2;
  return 1;
}

function conjunctionCount(snapshot: VedicSnapshot, key: string) {
  const point = snapshot.planets.find((candidate) => candidate.key === key);
  if (!point) {
    return 0;
  }

  return snapshot.planets.filter((candidate) => candidate.signIndex === point.signIndex).length - 1;
}

function compareRankArrays(left: readonly number[], right: readonly number[]) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
}

function getPlanetPoint(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((candidate) => candidate.key === key);
}

function getKarakaPoint(snapshot: VedicSnapshot, role: string) {
  const karaka = snapshot.charaKarakas.find((item) => item.role === role);
  return karaka
    ? snapshot.planets.find((point) => point.key === karaka.key)
    : undefined;
}

function signDistance(fromSignIndex: number, toSignIndex: number) {
  return modulo(toSignIndex - fromSignIndex, 12);
}

function buildRashiDrishtiRow(snapshot: VedicSnapshot, label: string, signIndex: number) {
  const targetSigns = rashiDrishtiTargets(signIndex);
  const receivingSigns = Array.from({ length: 12 }, (_, index) => index).filter((candidate) =>
    hasRashiDrishti(candidate, signIndex)
  );

  return [
    label,
    SIGN_NAMES[signIndex],
    signMode(signIndex),
    targetSigns.map((index) => SIGN_NAMES[index]).join(", "),
    joinedPlanetNames(targetSigns.flatMap((index) => findPlanetsInSign(snapshot, index))),
    receivingSigns.map((index) => SIGN_NAMES[index]).join(", "),
    joinedPlanetNames(receivingSigns.flatMap((index) => findPlanetsInSign(snapshot, index))),
  ];
}

function buildReferenceSignStrength(snapshot: VedicSnapshot, signIndex: number) {
  const occupants = snapshot.planets.filter((candidate) => candidate.signIndex === signIndex);
  const lordInfo = resolveOperationalLord(snapshot, signIndex);
  const watchedKeys = new Set(["mercury", "jupiter"]);
  if (lordInfo?.point?.key) {
    watchedKeys.add(lordInfo.point.key);
  }

  const aspectors = snapshot.planets.filter(
    (candidate) => watchedKeys.has(candidate.key) && hasRashiDrishti(candidate.signIndex, signIndex)
  );
  const parityBonus = lordInfo?.point && signIndex % 2 !== lordInfo.point.signIndex % 2 ? 1 : 0;

  return {
    signIndex,
    lordInfo,
    occupants,
    aspectors,
    rank: [
      occupants.length,
      aspectors.length,
      occupants.filter((candidate) => candidate.tags.includes("Exaltado")).length,
      parityBonus,
      signModeWeight(signIndex),
      lordInfo?.point?.degreeInSign ?? -1,
    ] as const,
  };
}

function chooseStrongerReferenceSign(snapshot: VedicSnapshot, leftSignIndex: number, rightSignIndex: number) {
  const left = buildReferenceSignStrength(snapshot, leftSignIndex);
  const right = buildReferenceSignStrength(snapshot, rightSignIndex);
  return compareRankArrays(left.rank, right.rank) >= 0 ? left : right;
}

function resolveOperationalLord(snapshot: VedicSnapshot, signIndex: number) {
  if (signIndex === 7) {
    const mars = getPlanetPoint(snapshot, "mars");
    const ketu = getPlanetPoint(snapshot, "southNode");
    if (!mars && !ketu) {
      return undefined;
    }

    if (mars?.signIndex === signIndex && ketu?.signIndex === signIndex) {
      return { point: mars ?? ketu!, note: "Vrischika com ambos os co-lords no proprio signo." };
    }
    if (mars?.signIndex === signIndex) {
      return { point: ketu ?? mars, note: "Vrischika com Mangala no proprio signo; working set usa Ketu." };
    }
    if (ketu?.signIndex === signIndex) {
      return { point: mars ?? ketu, note: "Vrischika com Ketu no proprio signo; working set usa Mangala." };
    }

    const candidates = [mars, ketu].filter(Boolean);
    const ranked = candidates
      .map((point) => ({
        point: point!,
        conjunctions: conjunctionCount(snapshot, point!.key),
        modeWeight: signModeWeight(point!.signIndex),
      }))
      .sort((left, right) =>
        right.conjunctions - left.conjunctions ||
        right.modeWeight - left.modeWeight ||
        right.point.degreeInSign - left.point.degreeInSign
      );
    return {
      point: ranked[0].point,
      note: "Vrischika com co-lords fora do signo: working set escolhe o mais forte por conjuncao, modalidade e grau.",
    };
  }

  if (signIndex === 10) {
    const saturn = getPlanetPoint(snapshot, "saturn");
    const rahu = getPlanetPoint(snapshot, "northNode");
    if (!saturn && !rahu) {
      return undefined;
    }

    if (saturn?.signIndex === signIndex && rahu?.signIndex === signIndex) {
      return { point: saturn ?? rahu!, note: "Kumbha com ambos os co-lords no proprio signo." };
    }
    if (saturn?.signIndex === signIndex) {
      return { point: rahu ?? saturn, note: "Kumbha com Shani no proprio signo; working set usa Rahu." };
    }
    if (rahu?.signIndex === signIndex) {
      return { point: saturn ?? rahu, note: "Kumbha com Rahu no proprio signo; working set usa Shani." };
    }

    const candidates = [saturn, rahu].filter(Boolean);
    const ranked = candidates
      .map((point) => ({
        point: point!,
        conjunctions: conjunctionCount(snapshot, point!.key),
        modeWeight: signModeWeight(point!.signIndex),
      }))
      .sort((left, right) =>
        right.conjunctions - left.conjunctions ||
        right.modeWeight - left.modeWeight ||
        right.point.degreeInSign - left.point.degreeInSign
      );
    return {
      point: ranked[0].point,
      note: "Kumbha com co-lords fora do signo: working set escolhe o mais forte por conjuncao, modalidade e grau.",
    };
  }

  const lordKey = SIGN_LORD_KEYS[signIndex];
  const point = getPlanetPoint(snapshot, lordKey);
  if (!point) {
    return undefined;
  }

  return {
    point,
    note: `Regente operacional do signo: ${point.name}.`,
  };
}

function getSixthWeekdayPlanetKey(key: string) {
  const index = WEEKDAY_PLANET_KEYS.indexOf(key as (typeof WEEKDAY_PLANET_KEYS)[number]);
  if (index === -1) {
    return undefined;
  }

  return WEEKDAY_PLANET_KEYS[modulo(index + 5, WEEKDAY_PLANET_KEYS.length)];
}

function buildJaiminiBrahma(snapshot: VedicSnapshot) {
  const lagnaSignIndex = snapshot.ascendant.signIndex;
  const oppositeSignIndex = modulo(lagnaSignIndex + 6, 12);
  const reference = chooseStrongerReferenceSign(snapshot, lagnaSignIndex, oppositeSignIndex);
  const candidateSignIndices = [
    modulo(reference.signIndex + 5, 12),
    modulo(reference.signIndex + 7, 12),
    modulo(reference.signIndex + 11, 12),
  ];
  const candidateHouseNumbers = [6, 8, 12] as const;
  const candidateSourceMap = candidateSignIndices.reduce<
    Map<string, { houses: number[]; signIndices: number[] }>
  >((map, signIndex, index) => {
    const key = SIGN_LORD_KEYS[signIndex];
    const existing = map.get(key) ?? { houses: [], signIndices: [] };
    existing.houses.push(candidateHouseNumbers[index]);
    existing.signIndices.push(signIndex);
    map.set(key, existing);
    return map;
  }, new Map());
  const atmakarakaPoint = getKarakaPoint(snapshot, "Atmakaraka");
  const eighthFromAtmakaraka = atmakarakaPoint ? modulo(atmakarakaPoint.signIndex + 7, 12) : undefined;
  const eighthLordKey =
    eighthFromAtmakaraka !== undefined ? SIGN_LORD_KEYS[eighthFromAtmakaraka] : undefined;
  const candidates = Array.from(candidateSourceMap.entries())
    .map(([key, source]) => {
      const point = getPlanetPoint(snapshot, key);
      if (!point) {
        return undefined;
      }

      const strong = dignityRank(point.tags) >= 2 ? 1 : 0;
      const odd = point.signIndex % 2 === 0 ? 1 : 0;
      const invisible = modulo(point.signIndex - reference.signIndex, 12) <= 5 ? 1 : 0;
      const invalidReasons = [
        ...(point.key === "saturn" ? ["Shani cai na excecao operacional de Brahma."] : []),
        ...(point.key === eighthLordKey && atmakarakaPoint
          ? [`${point.name} rege a 8a a partir de ${atmakarakaPoint.name}.`]
          : []),
        ...(point.signIndex === eighthFromAtmakaraka && atmakarakaPoint
          ? [`${point.name} ocupa a 8a a partir de ${atmakarakaPoint.name}.`]
          : []),
      ];

      return {
        point,
        sourceHouses: source.houses,
        sourceSigns: source.signIndices,
        strong: Boolean(strong),
        odd: Boolean(odd),
        invisible: Boolean(invisible),
        invalid: invalidReasons.length > 0,
        invalidReasons,
        sourceNote:
          `Lord operacional da ${source.houses.map((house) => `${house}a`).join(" / ")} a partir de ${SIGN_NAMES[reference.signIndex]}. ` +
          `Origem em ${source.signIndices.map((index) => SIGN_NAMES[index]).join(", ")}.`,
        rank: [
          strong + odd + invisible,
          strong as 0 | 1,
          odd as 0 | 1,
          invisible as 0 | 1,
          conjunctionCount(snapshot, point.key),
          signModeWeight(point.signIndex),
          point.degreeInSign,
        ] as const,
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .sort((left, right) => compareRankArrays(right.rank, left.rank));

  const fallbackPoint = resolveOperationalLord(snapshot, reference.signIndex)?.point ?? snapshot.ascendant;
  let selectedPoint = candidates[0]?.point ?? fallbackPoint;
  let replacement:
    | {
        fromPoint: VedicPoint;
        replacementPoint: VedicPoint;
        note: string;
      }
    | undefined;
  let note =
    `Working set de Brahma parte de ${SIGN_NAMES[reference.signIndex]}, mais forte entre Lagna e 7a. ` +
    "A escolha usa os lords da 6a, 8a e 12a, medidos por forca, imparidade e metade invisivel.";

  if (candidates[0]?.invalid) {
    const replacementKey = getSixthWeekdayPlanetKey(candidates[0].point.key);
    const replacementPoint = replacementKey ? getPlanetPoint(snapshot, replacementKey) : undefined;
    if (replacementPoint) {
      selectedPoint = replacementPoint;
      replacement = {
        fromPoint: candidates[0].point,
        replacementPoint,
        note:
          `${candidates[0].point.name} caiu em excecao do working set e foi substituido por ${replacementPoint.name} ` +
          "na sequencia semanal de 6a a partir dele.",
      };
      note += ` ${replacement.note}`;
    }
  }

  return {
    referenceSignIndex: reference.signIndex,
    point: selectedPoint,
    candidates,
    replacement,
    note,
  };
}

function buildJaiminiRudra(snapshot: VedicSnapshot) {
  const secondSignIndex = modulo(snapshot.ascendant.signIndex + 1, 12);
  const eighthSignIndex = modulo(snapshot.ascendant.signIndex + 7, 12);
  const candidates = [
    { label: "Lord da 2a", baseSignIndex: secondSignIndex, info: resolveOperationalLord(snapshot, secondSignIndex) },
    { label: "Lord da 8a", baseSignIndex: eighthSignIndex, info: resolveOperationalLord(snapshot, eighthSignIndex) },
  ]
    .filter((entry) => entry.info?.point)
    .map((entry) => ({
      label: entry.label,
      baseSignIndex: entry.baseSignIndex,
      point: entry.info!.point,
      note: entry.info!.note,
      rank: [
        dignityRank(entry.info!.point.tags),
        conjunctionCount(snapshot, entry.info!.point.key),
        signModeWeight(entry.info!.point.signIndex),
        hasRashiDrishti(entry.info!.point.signIndex, snapshot.ascendant.signIndex) ? 1 : 0,
        entry.info!.point.degreeInSign,
      ] as const,
    }))
    .sort((left, right) => compareRankArrays(right.rank, left.rank));

  const selected = candidates[0];
  const fallbackPoint = resolveOperationalLord(snapshot, snapshot.ascendant.signIndex)?.point ?? snapshot.ascendant;

  return {
    secondSignIndex,
    eighthSignIndex,
    candidates,
    point: selected?.point ?? fallbackPoint,
    note: selected
      ? `${selected.label} em ${SIGN_NAMES[selected.baseSignIndex]} venceu no working set de Rudra por dignidade, conjuncao, modalidade do signo e drishti ao Lagna. ${selected.note}`
      : "Sem lord operacional claro entre 2a e 8a; fallback no regente do Lagna.",
  };
}

function buildJaiminiMaheshwara(snapshot: VedicSnapshot) {
  const atmakarakaPoint = getKarakaPoint(snapshot, "Atmakaraka");
  const baseSignIndex = atmakarakaPoint
    ? modulo(atmakarakaPoint.signIndex + 7, 12)
    : modulo(snapshot.ascendant.signIndex + 7, 12);
  const lordInfo = resolveOperationalLord(snapshot, baseSignIndex);
  const point = lordInfo?.point ?? atmakarakaPoint ?? snapshot.ascendant;

  return {
    atmakarakaPoint,
    baseSignIndex,
    point,
    note: atmakarakaPoint
      ? `Working set de Maheshwara usa o lord operacional da 8a a partir do Atmakaraka (${atmakarakaPoint.name} em ${atmakarakaPoint.signName}). ${lordInfo?.note ?? "Sem lord claro; fallback aplicado."}`
      : `Sem Atmakaraka claro; fallback na 8a a partir do Lagna em ${SIGN_NAMES[baseSignIndex]}. ${lordInfo?.note ?? "Sem lord claro; fallback aplicado."}`,
  };
}

function buildJaiminiYogaState(snapshot: VedicSnapshot) {
  const atmakaraka = getKarakaPoint(snapshot, "Atmakaraka");
  const amatyakaraka = getKarakaPoint(snapshot, "Amatyakaraka");
  const arudhas = calculateArudhaSet(snapshot);
  const a2 = arudhas.find((entry) => entry.houseNumber === 2);
  const a11 = arudhas.find((entry) => entry.houseNumber === 11);
  const akAmkLinked =
    atmakaraka &&
    amatyakaraka &&
    (atmakaraka.signIndex === amatyakaraka.signIndex ||
      hasRashiDrishti(atmakaraka.signIndex, amatyakaraka.signIndex) ||
      hasRashiDrishti(amatyakaraka.signIndex, atmakaraka.signIndex));
  const akAmkSupported =
    atmakaraka &&
    amatyakaraka &&
    [1, 4, 5, 7, 9, 10].includes(atmakaraka.house) &&
    [1, 4, 5, 7, 9, 10].includes(amatyakaraka.house);
  const beneficSupport =
    a2 &&
    a11 &&
    snapshot.planets.filter(
      (point) =>
        NATURAL_BENEFICS.has(point.key) &&
        [a2.signIndex, a11.signIndex].includes(point.signIndex)
    ).length;
  const dhanalink =
    a2 &&
    a11 &&
    (a2.signIndex === a11.signIndex ||
      hasRashiDrishti(a2.signIndex, a11.signIndex) ||
      hasRashiDrishti(a11.signIndex, a2.signIndex));

  return {
    rajaValue: akAmkLinked ? (akAmkSupported ? "Presente" : "Parcial") : "Ausente",
    rajaNote:
      akAmkLinked && akAmkSupported
        ? "Atmakaraka e Amatyakaraka se ligam por signo/drishti e ambos caem em kendra ou trikona no working set atual."
        : akAmkLinked
          ? "Atmakaraka e Amatyakaraka se ligam por signo/drishti, mas sem o apoio angular completo nesta versao."
          : "Nao houve ligacao direta entre Atmakaraka e Amatyakaraka no working set atual.",
    rajaStatus: "implemented",
    dhanavalue: dhanalink ? (beneficSupport ? "Presente" : "Parcial") : "Ausente",
    dhanaNote:
      dhanalink && beneficSupport
        ? "A2 e A11 se ligam por signo/drishti e ainda recebem apoio benefico direto."
        : dhanalink
          ? "A2 e A11 se ligam, mas sem beneficos suficientes na malha curta atual."
          : "A2 e A11 nao fecharam ligacao clara por signo ou drishti nesta versao.",
    dhanaStatus: "implemented",
  } as const;
}

function buildYogadaState(
  snapshot: VedicSnapshot,
  anchors: Array<{ label: string; signIndex: number }>
) {
  const atmakaraka = getKarakaPoint(snapshot, "Atmakaraka");
  const amatyakaraka = getKarakaPoint(snapshot, "Amatyakaraka");
  const rows = snapshot.planets
    .map((point) => {
      const touchedAnchors = anchors.filter(
        (anchor) =>
          point.signIndex === anchor.signIndex || hasRashiDrishti(point.signIndex, anchor.signIndex)
      );
      const dignity = dignityRank(point.tags);
      const conjunctions = conjunctionCount(snapshot, point.key);
      const karakaBonus =
        point.key === atmakaraka?.key ? 1.5 : point.key === amatyakaraka?.key ? 1 : 0;
      const score = Number(
        (
          touchedAnchors.length * 3 +
          dignity * 1.5 +
          conjunctions * 0.5 +
          signModeWeight(point.signIndex) * 0.35 +
          karakaBonus
        ).toFixed(2)
      );

      return {
        point,
        touchedAnchors,
        dignity,
        conjunctions,
        karakaBonus,
        score,
        note: touchedAnchors.length
          ? `${point.name} toca ${touchedAnchors.map((anchor) => anchor.label).join(", ")} por signo ou Rashi Drishti.`
          : `${point.name} nao toca nenhum dos ancoras Jaimini do working set atual.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.point.name.localeCompare(right.point.name));

  const leader = rows[0];
  const supportCount = leader?.touchedAnchors.length ?? 0;
  const state =
    supportCount >= 3
      ? "Presente"
      : supportCount >= 2
        ? "Parcial"
        : "Ausente";
  const status =
    leader ? ("implemented" as const) : ("placeholder" as const);
  const note = leader
    ? `Working set Yogada v1 por ancoras ${anchors.map((anchor) => anchor.label).join(", ")}. ` +
      `${leader.note} Score ${leader.score.toFixed(2)} com dignidade ${leader.dignity}, ` +
      `${leader.conjunctions} conjuncao(oes) e bonus de karaka ${leader.karakaBonus.toFixed(1)}.`
    : "Sem candidato Yogada no working set atual.";

  return {
    leader,
    rows,
    state,
    status,
    note,
  };
}

function hasJaiminiSignLink(leftSignIndex: number, rightSignIndex: number) {
  return (
    leftSignIndex === rightSignIndex ||
    hasRashiDrishti(leftSignIndex, rightSignIndex) ||
    hasRashiDrishti(rightSignIndex, leftSignIndex)
  );
}

function buildPlanetArudhaRow(
  snapshot: VedicSnapshot,
  label: string,
  point: VedicPoint,
  anchors: Array<{ label: string; signIndex: number }>
): PlanetArudhaRow {
  const lordInfo = resolveOperationalLord(snapshot, point.signIndex);
  const lordPoint = lordInfo?.point ?? point;
  const distance = signDistance(point.signIndex, lordPoint.signIndex);
  let arudhaSignIndex = modulo(lordPoint.signIndex + distance, 12);
  let adjustmentApplied = false;
  let projectionNote =
    `Contagem de ${point.name} em ${point.signName} ate ${lordPoint.name} em ${lordPoint.signName}; ` +
    "a mesma distancia foi repetida a partir do regente operacional.";

  if (distance === 0 || distance === 6) {
    arudhaSignIndex = modulo(point.signIndex + 9, 12);
    adjustmentApplied = true;
    projectionNote =
      `Excecao 1/7 aplicada ao pada de ${point.name}: quando o regente cai no proprio signo ou na 7a, ` +
      "o resultado vai para a 10a a partir do signo-base.";
  }

  const touchedAnchors = anchors
    .filter((anchor) => hasJaiminiSignLink(arudhaSignIndex, anchor.signIndex))
    .map((anchor) => anchor.label);
  const score = Number(
    (
      touchedAnchors.length * 2 +
      dignityRank(point.tags) * 1.2 +
      conjunctionCount(snapshot, point.key) * 0.5 +
      signModeWeight(arudhaSignIndex) * 0.35
    ).toFixed(2)
  );

  return {
    label,
    point,
    lordPoint,
    arudhaSignIndex,
    arudhaSignName: SIGN_NAMES[arudhaSignIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, arudhaSignIndex) + 1,
    distance,
    adjustmentApplied,
    touchedAnchors,
    score,
    note:
      `${projectionNote} ${lordInfo?.note ?? "Sem nota extra do regente operacional."} ` +
      (touchedAnchors.length
        ? `O pada toca ${touchedAnchors.join(", ")} por signo ou Rashi Drishti.`
        : "O pada nao toca nenhum dos ancoras Jaimini desta rodada."),
  };
}

function buildPlanetArudhaState(rows: PlanetArudhaRow[]) {
  const byLabel = new Map(rows.map((row) => [row.label, row]));
  const atmakaraka = byLabel.get("Atmakaraka");
  const darakaraka = byLabel.get("Darakaraka");
  const amatyakaraka = byLabel.get("Amatyakaraka");
  const brahma = byLabel.get("Brahma");
  const rudra = byLabel.get("Rudra");
  const maheshwara = byLabel.get("Maheshwara");
  const yogada = byLabel.get("Yogada");

  const akDkLinked =
    atmakaraka && darakaraka
      ? hasJaiminiSignLink(atmakaraka.arudhaSignIndex, darakaraka.arudhaSignIndex)
      : false;
  const relationSupport =
    (atmakaraka?.touchedAnchors.filter((anchor) => ["Upapada", "Darapada", "Karakamsa", "Swamsa"].includes(anchor))
      .length ?? 0) +
    (darakaraka?.touchedAnchors.filter((anchor) => ["Upapada", "Darapada", "Karakamsa", "Swamsa"].includes(anchor))
      .length ?? 0) +
    (amatyakaraka?.touchedAnchors.includes("Arudha Lagna") ? 1 : 0);
  const relationshipState =
    akDkLinked && relationSupport >= 2 ? "Presente" : akDkLinked || relationSupport >= 2 ? "Parcial" : "Ausente";
  const relationshipStatus =
    atmakaraka && darakaraka ? ("implemented" as const) : ("placeholder" as const);

  const forceRows = [brahma, rudra, maheshwara].filter(
    (row): row is PlanetArudhaRow => Boolean(row)
  );
  const forceSupport = forceRows.reduce(
    (sum, row) =>
      sum +
      row.touchedAnchors.filter((anchor) =>
        ["Lagna", "Arudha Lagna", "Karakamsa", "Swamsa", "Yogada"].includes(anchor)
      ).length,
    0
  );
  const forceState = forceSupport >= 5 ? "Fechado" : forceSupport >= 3 ? "Parcial" : "Fraco";
  const forceStatus =
    forceRows.length ? ("implemented" as const) : ("placeholder" as const);

  return {
    relationshipState,
    relationshipStatus,
    relationshipNote:
      akDkLinked
        ? `AK e DK fecham ligacao por signo/drishti entre ${atmakaraka?.arudhaSignName ?? "--"} e ${darakaraka?.arudhaSignName ?? "--"}, com ${relationSupport} apoio(s) extra em UL, DP, Karakamsa, Swamsa ou AL.`
        : `AK e DK nao fecharam ligacao direta por signo/drishti; o working set ainda soma ${relationSupport} apoio(s) indireto(s) pelos demais ancoras.`,
    forceState,
    forceStatus,
    forceNote:
      forceRows.length
        ? `${forceRows.map((row) => `${row.label}: ${row.arudhaSignName}`).join(" | ")}. ` +
          `A triade soma ${forceSupport} toque(s) em Lagna, AL, Karakamsa, Swamsa e Yogada` +
          `${yogada ? `; Yogada atual em ${yogada.arudhaSignName}.` : "."}`
        : "Sem triade operacional de nomes-forca para cruzar com os padas planetarios.",
  };
}

function buildKarakamsaBridgeState(
  karakamsa: VedicPoint | undefined,
  swamsa: VedicPoint | undefined,
  supportAnchors: Array<{ label: string; signIndex?: number }>
) {
  if (!karakamsa || !swamsa) {
    return {
      state: "Fraca",
      status: "implemented" as const,
      note: "Sem Karakamsa ou Swamsa validos para montar a ponte profunda de Jaimini.",
    };
  }

  const directLink = hasJaiminiSignLink(karakamsa.signIndex, swamsa.signIndex);
  const supportHits = supportAnchors
    .filter(
      (anchor) =>
        anchor.signIndex !== undefined &&
        (hasJaiminiSignLink(karakamsa.signIndex, anchor.signIndex) ||
          hasJaiminiSignLink(swamsa.signIndex, anchor.signIndex))
    )
    .map((anchor) => anchor.label);
  const state =
    directLink && supportHits.length >= 2
      ? "Fechada"
      : directLink || supportHits.length >= 1
        ? "Parcial"
        : "Fraca";
  const status =
    state === "Fechada"
      ? ("implemented" as const)
      : ("implemented" as const);

  return {
    state,
    status,
    note: directLink
      ? `Karakamsa em ${karakamsa.signName} e Swamsa em ${swamsa.signName} se ligam por signo ou Rashi Drishti, com apoio extra de ${supportHits.join(", ") || "nenhuma ancora adicional"}.`
      : `Karakamsa em ${karakamsa.signName} e Swamsa em ${swamsa.signName} nao se ligam diretamente; a ponte depende de ${supportHits.join(", ") || "nenhum apoio extra"}.`,
  };
}

function buildJaiminiAnchorMesh(
  anchors: Array<{ label: string; signIndex: number }>,
  grahaArudhas: PlanetArudhaRow[],
  karakaPoints: Array<{ label: string; point?: VedicPoint }>,
  forcePoints: Array<{ label: string; point?: VedicPoint }>
) {
  const rows = anchors
    .map((anchor) => {
      const linkedAnchors = anchors
        .filter(
          (candidate) =>
            candidate.label !== anchor.label &&
            hasJaiminiSignLink(anchor.signIndex, candidate.signIndex)
        )
        .map((candidate) => candidate.label);
      const karakaTouches = karakaPoints
        .filter(
          (candidate) =>
            candidate.point && hasJaiminiSignLink(candidate.point.signIndex, anchor.signIndex)
        )
        .map((candidate) => candidate.label);
      const forceTouches = forcePoints
        .filter(
          (candidate) =>
            candidate.point && hasJaiminiSignLink(candidate.point.signIndex, anchor.signIndex)
        )
        .map((candidate) => candidate.label);
      const grahaArudhaTouches = grahaArudhas
        .filter((row) => hasJaiminiSignLink(row.arudhaSignIndex, anchor.signIndex))
        .map((row) => row.label);
      const score = Number(
        (
          linkedAnchors.length * 1.5 +
          karakaTouches.length * 1.5 +
          forceTouches.length * 1.1 +
          grahaArudhaTouches.length * 0.8 +
          signModeWeight(anchor.signIndex) * 0.35
        ).toFixed(2)
      );

      return {
        label: anchor.label,
        signIndex: anchor.signIndex,
        signName: SIGN_NAMES[anchor.signIndex],
        linkedAnchors,
        karakaTouches,
        forceTouches,
        grahaArudhaTouches,
        score,
        note:
          `${anchor.label} em ${SIGN_NAMES[anchor.signIndex]} liga ${linkedAnchors.join(", ") || "nenhuma ancora"}; ` +
          `recebe ${karakaTouches.join(", ") || "nenhum karaka"}, ${forceTouches.join(", ") || "nenhum nome-forca"} ` +
          `e ${grahaArudhaTouches.join(", ") || "nenhum Graha Arudha"} no working set atual.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  const denseCount = rows.filter((row) => row.score >= 8 || row.linkedAnchors.length >= 3).length;
  const totalAnchorLinks = rows.reduce((sum, row) => sum + row.linkedAnchors.length, 0);
  const state =
    denseCount >= 3 || totalAnchorLinks >= 18
      ? "Fechada"
      : denseCount >= 2 || totalAnchorLinks >= 12
        ? "Parcial"
        : "Fraca";
  const status =
    rows.length ? ("implemented" as const) : ("placeholder" as const);
  const leader = rows[0];

  return {
    rows,
    leader,
    state,
    status,
    note: leader
      ? `${leader.label} lidera a malha em ${leader.signName} com score ${leader.score.toFixed(2)}, ` +
        `${leader.linkedAnchors.length} ligacao(oes) entre ancoras, ${leader.karakaTouches.length} toque(s) de karaka e ` +
        `${leader.forceTouches.length} toque(s) dos nomes-forca.`
      : "Sem ancora dominante para a malha Jaimini nesta rodada.",
  };
}

export function jaiminiEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");
  const darakaraka = snapshot.charaKarakas.find((item) => item.role === "Darakaraka");
  const navamsa = snapshot.vargas.find((item) => item.key === "D9");
  const d60 = snapshot.vargas.find((item) => item.key === "D60");
  const navamsaAscendant = navamsa?.points.find((point) => point.key === "ascendant");
  const atmakarakaD9 = navamsa?.points.find((point) => point.key === atmakaraka?.key);
  const darakarakaD9 = navamsa?.points.find((point) => point.key === darakaraka?.key);
  const atmakarakaD60 = d60?.points.find((point) => point.key === atmakaraka?.key);
  const arudhas = calculateArudhaSet(snapshot);
  const arudhaLagna = arudhas.find((entry) => entry.houseNumber === 1);
  const upapada = arudhas.find((entry) => entry.houseNumber === 12);
  const darapada = arudhas.find((entry) => entry.houseNumber === 7);
  const akPoint = getKarakaPoint(snapshot, "Atmakaraka");
  const amkPoint = getKarakaPoint(snapshot, "Amatyakaraka");
  const dkPoint = getKarakaPoint(snapshot, "Darakaraka");
  const yogaState = buildJaiminiYogaState(snapshot);
  const brahma = buildJaiminiBrahma(snapshot);
  const rudra = buildJaiminiRudra(snapshot);
  const maheshwara = buildJaiminiMaheshwara(snapshot);
  const yogadaAnchors = [
    { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
    { label: "Arudha Lagna", signIndex: arudhaLagna?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Karakamsa", signIndex: atmakarakaD9?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Swamsa", signIndex: navamsaAscendant?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Upapada", signIndex: upapada?.signIndex ?? snapshot.ascendant.signIndex },
  ];
  const yogada = buildYogadaState(snapshot, yogadaAnchors);
  const drishtiTargets = [
    { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
    { label: "Atmakaraka", signIndex: akPoint?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Darakaraka", signIndex: dkPoint?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Arudha Lagna", signIndex: arudhaLagna?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Upapada", signIndex: upapada?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Darapada", signIndex: darapada?.signIndex ?? snapshot.ascendant.signIndex },
  ];
  const planetaryArudhaAnchors = [
    ...drishtiTargets,
    { label: "Karakamsa", signIndex: atmakarakaD9?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Swamsa", signIndex: navamsaAscendant?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Yogada", signIndex: yogada.leader?.point.signIndex ?? snapshot.ascendant.signIndex },
  ];
  const grahaArudhas = [
    ...(akPoint ? [buildPlanetArudhaRow(snapshot, "Atmakaraka", akPoint, planetaryArudhaAnchors)] : []),
    ...(amkPoint ? [buildPlanetArudhaRow(snapshot, "Amatyakaraka", amkPoint, planetaryArudhaAnchors)] : []),
    ...(dkPoint ? [buildPlanetArudhaRow(snapshot, "Darakaraka", dkPoint, planetaryArudhaAnchors)] : []),
    [buildPlanetArudhaRow(snapshot, "Brahma", brahma.point, planetaryArudhaAnchors)],
    [buildPlanetArudhaRow(snapshot, "Rudra", rudra.point, planetaryArudhaAnchors)],
    [buildPlanetArudhaRow(snapshot, "Maheshwara", maheshwara.point, planetaryArudhaAnchors)],
    ...(yogada.leader ? [buildPlanetArudhaRow(snapshot, "Yogada", yogada.leader.point, planetaryArudhaAnchors)] : []),
  ].flat();
  const grahaArudhasRanked = [...grahaArudhas].sort(
    (left, right) => right.score - left.score || left.label.localeCompare(right.label)
  );
  const grahaArudhaState = buildPlanetArudhaState(grahaArudhas);
  const karakamsaBridge = buildKarakamsaBridgeState(atmakarakaD9, navamsaAscendant, [
    { label: "Arudha Lagna", signIndex: arudhaLagna?.signIndex },
    { label: "Upapada", signIndex: upapada?.signIndex },
    { label: "Darapada", signIndex: darapada?.signIndex },
    { label: "Darakaraka D9", signIndex: darakarakaD9?.signIndex },
  ]);
  const anchorMesh = buildJaiminiAnchorMesh(
    [
      { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
      { label: "Arudha Lagna", signIndex: arudhaLagna?.signIndex ?? snapshot.ascendant.signIndex },
      { label: "Karakamsa", signIndex: atmakarakaD9?.signIndex ?? snapshot.ascendant.signIndex },
      { label: "Swamsa", signIndex: navamsaAscendant?.signIndex ?? snapshot.ascendant.signIndex },
      { label: "Upapada", signIndex: upapada?.signIndex ?? snapshot.ascendant.signIndex },
      { label: "Darapada", signIndex: darapada?.signIndex ?? snapshot.ascendant.signIndex },
      ...(yogada.leader ? [{ label: "Yogada", signIndex: yogada.leader.point.signIndex }] : []),
    ],
    grahaArudhas,
    [
      { label: "AK", point: akPoint },
      { label: "AmK", point: amkPoint },
      { label: "DK", point: dkPoint },
    ],
    [
      { label: "Brahma", point: brahma.point },
      { label: "Rudra", point: rudra.point },
      { label: "Maheshwara", point: maheshwara.point },
      { label: "Yogada", point: yogada.leader?.point },
    ]
  );
  const triadRows = [
    { label: "Brahma", point: brahma.point, note: brahma.note },
    { label: "Rudra", point: rudra.point, note: rudra.note },
    { label: "Maheshwara", point: maheshwara.point, note: maheshwara.note },
  ]
    .map((row, _, all) => {
      const linkedAnchors = anchorMesh.rows
        .filter((anchor) => hasJaiminiSignLink(row.point.signIndex, anchor.signIndex))
        .map((anchor) => anchor.label);
      const linkedTriad = all
        .filter(
          (candidate) =>
            candidate.label !== row.label &&
            hasJaiminiSignLink(candidate.point.signIndex, row.point.signIndex)
        )
        .map((candidate) => candidate.label);
      const arudhaRow = grahaArudhas.find((entry) => entry.label === row.label);
      const score = Number(
        (
          linkedAnchors.length * 1.5 +
          linkedTriad.length * 1.25 +
          (arudhaRow?.touchedAnchors.length ?? 0) * 0.75 +
          signModeWeight(row.point.signIndex) * 0.35
        ).toFixed(2)
      );

      return {
        ...row,
        linkedAnchors,
        linkedTriad,
        arudhaSignName: arudhaRow?.arudhaSignName ?? "--",
        arudhaTouches: arudhaRow?.touchedAnchors ?? [],
        score,
        note:
          `${row.note} ` +
          (linkedAnchors.length
            ? `Liga com ${linkedAnchors.join(", ")} na malha Jaimini.`
            : "Ainda nao fecha ancora forte na malha curta.") +
          ` Graha Arudha em ${arudhaRow?.arudhaSignName ?? "--"}.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
  const triadLeader = triadRows[0];
  const triadSupport = triadRows.reduce(
    (sum, row) => sum + row.linkedAnchors.length + row.linkedTriad.length + row.arudhaTouches.length,
    0
  );
  const triadState =
    triadLeader && triadLeader.score >= 7.5 && triadSupport >= 18
      ? "Fechada"
      : triadLeader && triadLeader.score >= 5 && triadSupport >= 12
        ? "Parcial"
        : "Fraca";
  const triadStatus =
    triadRows.length ? ("implemented" as const) : ("placeholder" as const);
  const deepLayerStatus =
    atmakarakaD9 || navamsaAscendant || arudhaLagna || upapada
      ? ("implemented" as const)
      : ("placeholder" as const);
  const advancedLayerStatus =
    grahaArudhas.length
      ? ("implemented" as const)
      : ("placeholder" as const);

  return {
    sections: [
      createSection({
        id: `${module}-jaimini`,
        title: "Jaimini",
        description:
          "Chara Karakas calculados e pontos de amarre para Karakamsa, Swamsa, Arudha e dashas Jaimini.",
        status: "implemented",
        items: snapshot.charaKarakas.map((item) =>
          createDatum(module, "Chara Karaka", item.role, `${item.name} em ${item.signName}`, {
            relatedPlanet: item.name,
            relatedHouse: item.house,
            technicalNotes: `${item.degreeInSign.toFixed(2)} graus no signo.`,
            confidence: 0.8,
          })
        ),
      }),
      createSection({
        id: `${module}-jaimini-deep`,
        title: "Jaimini Profundo",
        description:
          "Camada adicional de Jaimini com Karakamsa, Swamsa, Arudha Lagna e posicao do Atmakaraka em D9 e D60.",
        status: deepLayerStatus,
        items: [
          createDatum(
            module,
            "Jaimini",
            "Karakamsa",
            atmakarakaD9 ? atmakarakaD9.signName : "Pendente",
            {
              technicalNotes:
                atmakarakaD9
                  ? `Derivado do Atmakaraka em D9 (${atmakaraka?.name} em ${atmakarakaD9.signName}).`
                  : "Sem Atmakaraka identificado no D9.",
              confidence: atmakarakaD9 ? 0.76 : 0.25,
              status: atmakarakaD9 ? "implemented" : "placeholder",
            }
          ),
          createDatum(
            module,
            "Jaimini",
            "Swamsa",
            navamsaAscendant?.signName ?? "Pendente",
            {
              technicalNotes: navamsaAscendant
                ? "Tomado do Lagna do Navamsa como Swamsa operacional do modulo."
                : "Sem Lagna de D9 disponivel.",
              confidence: navamsaAscendant ? 0.7 : 0.25,
              status: navamsaAscendant ? "implemented" : "placeholder",
            }
          ),
          createDatum(module, "Jaimini", "Atmakaraka no D60", atmakarakaD60?.signName ?? "Pendente", {
            technicalNotes:
              atmakarakaD60
                ? `Leitura do Atmakaraka em D60 para camada karmica fina (${atmakaraka?.name} em ${atmakarakaD60.signName}).`
                : "Sem ponto correspondente no D60.",
            confidence: atmakarakaD60 ? 0.66 : 0.25,
            status: atmakarakaD60 ? "implemented" : "placeholder",
          }),
          createDatum(module, "Jaimini", "Arudha Lagna", arudhaLagna?.signName ?? "Pendente", {
            technicalNotes: arudhaLagna?.note ?? "Arudha Lagna ainda nao disponivel.",
            confidence: arudhaLagna ? 0.74 : 0.25,
            status: arudhaLagna ? "implemented" : "placeholder",
          }),
          createDatum(module, "Jaimini", "Upapada", upapada?.signName ?? "Pendente", {
            technicalNotes: upapada?.note ?? "Upapada ainda nao disponivel.",
            confidence: upapada ? 0.72 : 0.25,
            status: upapada ? "implemented" : "placeholder",
          }),
          createDatum(module, "Jaimini", "Ponte Karakamsa-Swamsa", karakamsaBridge.state, {
            technicalNotes: karakamsaBridge.note,
            confidence:
              karakamsaBridge.state === "Fechada"
                ? 0.72
                : karakamsaBridge.state === "Parcial"
                  ? 0.6
                  : 0.34,
            status: karakamsaBridge.status,
            methodUsed: "working-set-jaimini-karakamsa-swamsa-bridge-v1",
          }),
          createDatum(
            module,
            "Jaimini",
            "Ancora dominante da malha",
            anchorMesh.leader ? `${anchorMesh.leader.label}: ${anchorMesh.leader.signName}` : "--",
            {
              technicalNotes: anchorMesh.note,
              confidence: anchorMesh.leader ? 0.66 : 0.3,
              status: anchorMesh.leader ? "implemented" : "placeholder",
              methodUsed: "working-set-jaimini-anchor-mesh-v1",
            }
          ),
        ],
        tables: [
          createTable(
            `${module}-jaimini-rashi-drishti`,
            "Rashi Drishti Jaimini",
            ["Alvo", "Signo", "Modo", "Aspecta", "Planetas nos signos vistos", "Recebe de", "Planetas que o veem"],
            drishtiTargets.map((target) => buildRashiDrishtiRow(snapshot, target.label, target.signIndex)),
            "Recorte sign-based de Jaimini: signos moveis olham fixos (exceto o adjacente), fixos olham moveis (exceto o adjacente) e duplos olham duplos."
          ),
          createTable(
            `${module}-jaimini-karakamsa`,
            "Karakamsa e Swamsa",
            ["Ponto", "Signo", "Casa em D9", "Ocupantes no signo", "Rashi Drishti recebida", "Nota"],
            [
              [
                "Karakamsa",
                atmakarakaD9?.signName ?? "--",
                atmakarakaD9?.house?.toString() ?? "--",
                atmakarakaD9 ? joinedPlanetNames(navamsa?.points.filter((point) => point.signIndex === atmakarakaD9.signIndex) ?? []) : "--",
                atmakarakaD9
                  ? Array.from({ length: 12 }, (_, index) => index)
                      .filter((candidate) => hasRashiDrishti(candidate, atmakarakaD9.signIndex))
                      .map((index) => SIGN_NAMES[index])
                      .join(", ")
                  : "--",
                atmakarakaD9
                  ? `Atmakaraka ${atmakaraka?.name} projetado no D9 em ${atmakarakaD9.signName}.`
                  : "Sem Atmakaraka no D9.",
              ],
              [
                "Swamsa",
                navamsaAscendant?.signName ?? "--",
                navamsaAscendant?.house?.toString() ?? "--",
                navamsaAscendant ? joinedPlanetNames(navamsa?.points.filter((point) => point.signIndex === navamsaAscendant.signIndex) ?? []) : "--",
                navamsaAscendant
                  ? Array.from({ length: 12 }, (_, index) => index)
                      .filter((candidate) => hasRashiDrishti(candidate, navamsaAscendant.signIndex))
                      .map((index) => SIGN_NAMES[index])
                      .join(", ")
                  : "--",
                navamsaAscendant
                  ? "Lagna do Navamsa usado como Swamsa operacional."
                  : "Sem Lagna no D9.",
              ],
              [
                "Darakaraka no D9",
                darakarakaD9?.signName ?? "--",
                darakarakaD9?.house?.toString() ?? "--",
                darakarakaD9 ? joinedPlanetNames(navamsa?.points.filter((point) => point.signIndex === darakarakaD9.signIndex) ?? []) : "--",
                darakarakaD9
                  ? Array.from({ length: 12 }, (_, index) => index)
                      .filter((candidate) => hasRashiDrishti(candidate, darakarakaD9.signIndex))
                      .map((index) => SIGN_NAMES[index])
                      .join(", ")
                  : "--",
                darakarakaD9
                  ? `Darakaraka ${darakaraka?.name} refinado em Navamsa.`
                  : "Sem Darakaraka refinado em D9.",
              ],
            ],
            "Tabela de ancoras Jaimini em Navamsa para cruzar karakas, compromisso e padas."
          ),
          createTable(
            `${module}-jaimini-anchor-mesh`,
            "Malha de Ancoras Jaimini",
            ["Ancora", "Signo", "Liga com", "Karakas", "Nomes-forca", "Graha Arudhas", "Score", "Nota"],
            anchorMesh.rows.map((row) => [
              row.label,
              row.signName,
              row.linkedAnchors.join(", ") || "--",
              row.karakaTouches.join(", ") || "--",
              row.forceTouches.join(", ") || "--",
              row.grahaArudhaTouches.join(", ") || "--",
              row.score.toFixed(2),
              row.note,
            ]),
            "Malha curta de ancoras Jaimini para mostrar onde Lagna, AL, UL, DP, Karakamsa, Swamsa e Yogada realmente se fecham por signo ou Rashi Drishti."
          ),
        ],
      }),
      createSection({
        id: `${module}-jaimini-advanced`,
        title: "Jaimini Avancado",
        description:
          "A camada avancada agora cruza Rashi Drishti, karakas e arudhas para abrir um working set real de yogas Jaimini, deixando apenas o miolo mais controverso por escola em aberto.",
        status: advancedLayerStatus,
        items: [
          createDatum(module, "Jaimini", "Jaimini Raja Yoga", yogaState.rajaValue, {
            technicalNotes: yogaState.rajaNote,
            confidence: yogaState.rajaValue === "Presente" ? 0.7 : 0.52,
            status: yogaState.rajaStatus,
            methodUsed: "working-set-ak-amk-rashi-drishti",
          }),
          createDatum(module, "Jaimini", "Jaimini Dhana Yoga", yogaState.dhanavalue, {
            technicalNotes: yogaState.dhanaNote,
            confidence: yogaState.dhanavalue === "Presente" ? 0.66 : 0.5,
            status: yogaState.dhanaStatus,
            methodUsed: "working-set-a2-a11-benefic-support",
          }),
          createDatum(module, "Jaimini", "Yogada", yogada.state, {
            technicalNotes: yogada.note,
            confidence: yogada.leader ? (yogada.state === "Presente" ? 0.68 : yogada.state === "Parcial" ? 0.56 : 0.38) : 0.25,
            status: yogada.status,
            methodUsed: "working-set-yogada-anchors-v1",
          }),
          createDatum(module, "Jaimini", "Malha de ancoras Jaimini", anchorMesh.state, {
            technicalNotes: anchorMesh.note,
            confidence:
              anchorMesh.state === "Fechada"
                ? 0.68
                : anchorMesh.state === "Parcial"
                  ? 0.58
                  : 0.36,
            status: anchorMesh.status,
            methodUsed: "working-set-jaimini-anchor-mesh-v1",
          }),
          createDatum(
            module,
            "Jaimini",
            "Ligacao AK-DK por Graha Arudha",
            grahaArudhaState.relationshipState,
            {
              technicalNotes: grahaArudhaState.relationshipNote,
              confidence:
                grahaArudhaState.relationshipState === "Presente"
                  ? 0.64
                  : grahaArudhaState.relationshipState === "Parcial"
                    ? 0.54
                    : 0.36,
              status: grahaArudhaState.relationshipStatus,
              methodUsed: "working-set-graha-arudha-ak-dk-v1",
            }
          ),
          createDatum(
            module,
            "Jaimini",
            "Overlay dos nomes-forca",
            grahaArudhaState.forceState,
            {
              technicalNotes: grahaArudhaState.forceNote,
              confidence:
                grahaArudhaState.forceState === "Fechado"
                  ? 0.62
                  : grahaArudhaState.forceState === "Parcial"
                    ? 0.54
                    : 0.34,
              status: grahaArudhaState.forceStatus,
              methodUsed: "working-set-graha-arudha-force-overlay-v1",
            }
          ),
          createDatum(
            module,
            "Jaimini",
            "Graha Arudha lider",
            grahaArudhasRanked[0]
              ? `${grahaArudhasRanked[0].label}: ${grahaArudhasRanked[0].arudhaSignName}`
              : "--",
            {
              technicalNotes: grahaArudhasRanked[0]
                ? `${grahaArudhasRanked[0].point.name} lidera os padas planetarios com score ${grahaArudhasRanked[0].score.toFixed(2)} e toque em ${grahaArudhasRanked[0].touchedAnchors.join(", ") || "nenhum ancora"}.`
                : "Sem pada planetario elegivel nesta rodada.",
              confidence: grahaArudhasRanked[0] ? 0.6 : 0.25,
              status: grahaArudhasRanked[0] ? "implemented" : "placeholder",
              methodUsed: "working-set-graha-arudha-ranking-v1",
            }
          ),
          createDatum(module, "Jaimini", "Coesao da triade Jaimini", triadState, {
            technicalNotes: triadLeader
              ? `${triadLeader.label} lidera a triade com score ${triadLeader.score.toFixed(2)}; a malha soma ${triadSupport} toque(s) entre ancoras, nomes-forca e Graha Arudhas.`
              : "Sem lider claro para a triade Jaimini nesta rodada.",
            confidence:
              triadState === "Fechada" ? 0.7 : triadState === "Parcial" ? 0.58 : 0.34,
            status: triadStatus,
            methodUsed: "working-set-jaimini-triad-cohesion-v1",
          }),
          createDatum(module, "Jaimini", "Brahma operacional", `${brahma.point.name} em ${brahma.point.signName}`, {
            technicalNotes: brahma.note,
            confidence: 0.63,
            status: "implemented",
            methodUsed: "working-set-jaimini-brahma-v1",
          }),
          createDatum(module, "Jaimini", "Rudra operacional", `${rudra.point.name} em ${rudra.point.signName}`, {
            technicalNotes: rudra.note,
            confidence: 0.61,
            status: "implemented",
            methodUsed: "working-set-jaimini-rudra-v1",
          }),
          createDatum(
            module,
            "Jaimini",
            "Maheshwara operacional",
            `${maheshwara.point.name} em ${maheshwara.point.signName}`,
            {
              technicalNotes: maheshwara.note,
              confidence: 0.6,
              status: "implemented",
              methodUsed: "working-set-jaimini-maheshwara-v1",
            }
          ),
          ...(brahma.replacement
            ? [
                createDatum(
                  module,
                  "Jaimini",
                  "Excecao semanal de Brahma",
                  `${brahma.replacement.fromPoint.name} -> ${brahma.replacement.replacementPoint.name}`,
                  {
                    technicalNotes: brahma.replacement.note,
                    confidence: 0.58,
                    status: "implemented",
                    methodUsed: "working-set-jaimini-brahma-weekday-exception-v1",
                  }
                ),
              ]
            : []),
          createDatum(module, "Jaimini", "Nomes-forca Jaimini", "Calculados e cruzados", {
            technicalNotes:
              `Brahma, Rudra e Maheshwara agora saem em working set operacional explicito e entram na malha de ancoras com estado ${anchorMesh.state.toLowerCase()}.`,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "working-set-jaimini-force-names-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-jaimini-padas`,
            "Padas e Relacoes",
            ["Pada", "Signo", "Casa do Lagna", "Regente", "Relacao com AK", "Relacao com DK"],
            arudhas
              .filter((entry) => [1, 2, 7, 11, 12].includes(entry.houseNumber))
              .map((entry) => [
                entry.houseLabel,
                entry.signName,
                entry.houseFromLagna.toString(),
                entry.lordLabel,
                akPoint ? `${signDistance(akPoint.signIndex, entry.signIndex) + 1}a` : "--",
                dkPoint ? `${signDistance(dkPoint.signIndex, entry.signIndex) + 1}a` : "--",
              ]),
            "Mostra os padas mais usados no working set atual de riqueza, casamento e imagem social."
          ),
          createTable(
            `${module}-jaimini-graha-arudhas`,
            "Graha Arudhas Jaimini",
            ["Rotulo", "Graha", "Signo base", "Regente operacional", "Regente em", "Distancia", "Pada", "Casa", "Anchors tocados", "Ajuste", "Score", "Nota"],
            grahaArudhasRanked.map((row) => [
              row.label,
              row.point.name,
              row.point.signName,
              row.lordPoint.name,
              row.lordPoint.signName,
              row.distance.toString(),
              row.arudhaSignName,
              row.houseFromLagna.toString(),
              row.touchedAnchors.join(", ") || "--",
              row.adjustmentApplied ? "Sim" : "Nao",
              row.score.toFixed(2),
              row.note,
            ]),
            "Padas planetarios do working set Jaimini atual, cruzando karakas, nomes-forca, Yogada e ancoras de Arudha/Navamsa."
          ),
          createTable(
            `${module}-jaimini-force-names`,
            "Brahma, Rudra e Maheshwara",
            ["Nome-forca", "Base", "Graha", "Signo", "Casa", "Observacao"],
            [
              [
                "Brahma",
                `Referencia ${SIGN_NAMES[brahma.referenceSignIndex]}`,
                brahma.point.name,
                brahma.point.signName,
                brahma.point.house.toString(),
                brahma.note,
              ],
              [
                "Rudra",
                `2a/8a a partir do Lagna (${SIGN_NAMES[rudra.secondSignIndex]} / ${SIGN_NAMES[rudra.eighthSignIndex]})`,
                rudra.point.name,
                rudra.point.signName,
                rudra.point.house.toString(),
                rudra.note,
              ],
              [
                "Maheshwara",
                maheshwara.atmakarakaPoint
                  ? `8a de AK em ${SIGN_NAMES[maheshwara.baseSignIndex]}`
                  : `8a do Lagna em ${SIGN_NAMES[maheshwara.baseSignIndex]}`,
                maheshwara.point.name,
                maheshwara.point.signName,
                maheshwara.point.house.toString(),
                maheshwara.note,
              ],
            ],
            "Camada operacional dos nomes-forca Jaimini, mantendo a escola explicitada no proprio datum."
          ),
          createTable(
            `${module}-jaimini-force-triad`,
            "Coesao da Triade Jaimini",
            ["Nome-forca", "Signo", "Liga com ancoras", "Liga com", "Graha Arudha", "Score", "Nota"],
            triadRows.map((row) => [
              row.label,
              row.point.signName,
              row.linkedAnchors.join(", ") || "--",
              row.linkedTriad.join(", ") || "--",
              row.arudhaSignName,
              row.score.toFixed(2),
              row.note,
            ]),
            "Painel curto para mostrar onde Brahma, Rudra e Maheshwara realmente fecham com Lagna, AL, Karakamsa, Swamsa, UL, DP e a propria camada de Graha Arudha."
          ),
          createTable(
            `${module}-jaimini-yogada-candidates`,
            "Candidatos de Yogada",
            ["Graha", "Signo", "Anchors tocados", "Dignidade", "Conjuncoes", "Bonus karaka", "Score", "Nota"],
            yogada.rows.slice(0, 8).map((row) => [
              row.point.name,
              row.point.signName,
              row.touchedAnchors.length ? row.touchedAnchors.map((anchor) => anchor.label).join(", ") : "--",
              row.dignity.toString(),
              row.conjunctions.toString(),
              row.karakaBonus.toFixed(1),
              row.score.toFixed(2),
              row.note,
            ]),
            "Working set Yogada v1: ranqueia grahas que tocam Lagna, Arudha Lagna, Karakamsa, Swamsa e Upapada por signo ou Rashi Drishti."
          ),
          createTable(
            `${module}-jaimini-brahma-candidates`,
            "Candidatos de Brahma",
            ["Fonte", "Graha", "Signo", "Forte", "Impar", "Metade invisivel", "Score", "Excecao", "Selecionado", "Nota"],
            [
              ...brahma.candidates.map((candidate) => [
                `${candidate.sourceHouses.map((house) => `${house}a`).join(", ")} da referencia`,
                candidate.point.name,
                candidate.point.signName,
                candidate.strong ? "Sim" : "Nao",
                candidate.odd ? "Sim" : "Nao",
                candidate.invisible ? "Sim" : "Nao",
                candidate.rank.join("/"),
                candidate.invalid ? candidate.invalidReasons.join(" ") : "Sem excecao ativa.",
                !brahma.replacement &&
                candidate.point.key === brahma.point.key &&
                candidate.point.signIndex === brahma.point.signIndex
                  ? "Sim"
                  : "Nao",
                candidate.sourceNote,
              ]),
              ...(brahma.replacement
                ? [
                    [
                      "Substituicao semanal de 6a",
                      brahma.replacement.replacementPoint.name,
                      brahma.replacement.replacementPoint.signName,
                      dignityRank(brahma.replacement.replacementPoint.tags) >= 2 ? "Sim" : "Nao",
                      brahma.replacement.replacementPoint.signIndex % 2 === 0 ? "Sim" : "Nao",
                      modulo(brahma.replacement.replacementPoint.signIndex - brahma.referenceSignIndex, 12) <= 5
                        ? "Sim"
                        : "Nao",
                      "substituicao",
                      "Aplicada por excecao semanal.",
                      "Sim",
                      brahma.replacement.note,
                    ],
                  ]
                : []),
            ],
            "Transparencia da escolha de Brahma para o working set atual."
          ),
        ],
      }),
    ],
    summary: [
      yogada.leader
        ? `Yogada lider em ${yogada.leader.point.name} com score ${yogada.leader.score.toFixed(2)}.`
        : "Sem Yogada lider claro nesta rodada.",
      grahaArudhasRanked[0]
        ? `Graha Arudha lider: ${grahaArudhasRanked[0].label} em ${grahaArudhasRanked[0].arudhaSignName}.`
        : "Sem Graha Arudha lider nesta rodada.",
      `Ponte Karakamsa-Swamsa: ${karakamsaBridge.state}; malha de ancoras em ${anchorMesh.state}.`,
      `Triade Jaimini em ${triadState}${triadLeader ? `, puxada por ${triadLeader.label}` : ""}.`,
      `Ligacao AK-DK por Graha Arudha: ${grahaArudhaState.relationshipState}.`,
      `Overlay dos nomes-forca: ${grahaArudhaState.forceState}.`,
    ],
  };
}
