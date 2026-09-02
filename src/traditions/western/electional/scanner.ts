import moment from "moment-timezone";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import type { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { compareElections, evaluateElection } from "./engine";
import type { ElectionalCandidateResult, ElectionalContinuousWindow, ElectionalScanRequest, ElectionalScanResult } from "./types";

function parseHm(hm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) throw new Error(`Hora inválida: ${hm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

function practicalAllowed(local: moment.Moment, req: ElectionalScanRequest): boolean {
  const c = req.constraints;
  if (c.allowedWeekdays?.length && !c.allowedWeekdays.includes(local.day())) return false;
  if (c.allowedLocalHours?.length) {
    const minute = local.hour() * 60 + local.minute();
    const inside = c.allowedLocalHours.some(w => minute >= parseHm(w.start) && minute <= parseHm(w.end));
    if (!inside) return false;
  }
  if (c.blocked?.some(b => {
    const s = moment.tz(b.startLocal, c.coordinates.timezone);
    const e = moment.tz(b.endLocal, c.coordinates.timezone);
    return local.isSameOrAfter(s) && local.isSameOrBefore(e);
  })) return false;
  return true;
}

function asBirthDate(local: moment.Moment, req: ElectionalScanRequest): BirthDate {
  return {
    year: local.year(), month: local.month()+1, day: local.date(), time: local.format("HH:mm:ss"),
    coordinates: {
      latitude: req.constraints.coordinates.latitude,
      longitude: req.constraints.coordinates.longitude,
      name: req.constraints.coordinates.name ?? "Eleição",
      timezone: req.constraints.coordinates.timezone,
    } as BirthDate["coordinates"],
  };
}

function sameRankShape(a: ElectionalCandidateResult, b: ElectionalCandidateResult): boolean {
  return a.evaluation.band === b.evaluation.band && a.evaluation.hardVetoes.length === b.evaluation.hardVetoes.length && a.evaluation.criticalRisks.length === b.evaluation.criticalRisks.length;
}

function buildWindows(sortedChronologically: ElectionalCandidateResult[], step: number): ElectionalContinuousWindow[] {
  if (!sortedChronologically.length) return [];
  const accepted = sortedChronologically.filter(x => x.evaluation.band !== "REJEITAR" && x.evaluation.band !== "FRACA");
  const windows: ElectionalContinuousWindow[] = [];
  let group: ElectionalCandidateResult[] = [];
  const flush = () => {
    if (!group.length) return;
    const ranked = [...group].sort((a,b)=>compareElections(a.evaluation,b.evaluation));
    const peak = ranked[0];
    windows.push({
      startLocal: group[0].localDateTime,
      endLocal: group[group.length-1].localDateTime,
      peakLocal: peak.localDateTime,
      band: peak.evaluation.band,
      candidateCount: group.length,
      note: "Faixa contínua: o pico é referência comparativa interna, não um minuto mágico. Execute dentro da banda conforme a viabilidade concreta.",
    });
    group = [];
  };
  for (const cur of accepted) {
    if (!group.length) { group=[cur]; continue; }
    const prev=group[group.length-1];
    const gap=moment(cur.localDateTime).diff(moment(prev.localDateTime),"minutes");
    if (gap <= step*1.25 && sameRankShape(prev,cur)) group.push(cur); else { flush(); group=[cur]; }
  }
  flush();
  return windows;
}

export async function scanElectionalWindow(req: ElectionalScanRequest): Promise<ElectionalScanResult> {
  const zone=req.constraints.coordinates.timezone;
  if (!moment.tz.zone(zone)) throw new Error(`Fuso IANA inválido: ${zone}`);
  const start=moment.tz(req.constraints.startLocal, zone);
  const end=moment.tz(req.constraints.endLocal, zone);
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) throw new Error("Janela eletiva inválida.");
  const step=Math.max(1, Math.min(180, req.constraints.stepMinutes ?? 15));
  const max=Math.max(1, Math.min(1000, req.constraints.maxCandidates ?? 300));
  const candidates: ElectionalCandidateResult[]=[];
  let rejectedByPracticalConstraints=0;
  let generated=0;
  for (let cursor=start.clone(); cursor.isSameOrBefore(end); cursor.add(step,"minutes")) {
    if (!practicalAllowed(cursor,req)) { rejectedByPracticalConstraints++; continue; }
    if (generated>=max) throw new Error(`Janela excede maxCandidates=${max}; aumente o passo ou reduza o intervalo.`);
    const chart=await calculateBirthChart(asBirthDate(cursor,req));
    const evaluation=evaluateElection({ methodMode:req.methodMode, goal:req.goal, objective:req.objective, electionChart:chart, natalCharts:req.natalCharts });
    candidates.push({localDateTime:cursor.format(),evaluation});
    generated++;
  }
  const ranked=[...candidates].sort((a,b)=>compareElections(a.evaluation,b.evaluation)).slice(0,Math.max(1,Math.min(50,req.topN??10)));
  const chronological=[...candidates].sort((a,b)=>a.localDateTime.localeCompare(b.localDateTime));
  return {
    module:"western/electional", generatedCandidates:generated, rejectedByPracticalConstraints,
    ranked, windows:buildWindows(chronological,step),
    warning:"A varredura calcula mapas independentes apenas dentro do módulo Eletiva. O cálculo completo de estrelas do núcleo comum pode tornar janelas muito grandes lentas; use passo largo na triagem e refine apenas os finalistas.",
  };
}
