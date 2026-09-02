"use client";

import type {
  CrossAspectContact,
  CrossReception,
  NatalInteractionPattern,
  SynastryAIEvaluationPacket,
  SynastryAnalysis,
  SynastrySourceStatus,
} from "@/traditions/western/synastry";

function metricLabel(value: string) {
  return value.replaceAll("-", " ");
}

function statusLabel(status: SynastrySourceStatus) {
  if (status === "source-locked") return "fonte direta";
  if (status === "example-derived") return "derivado de exemplo";
  return "derivação explícita";
}

function SourceBadge({ status }: { status: SynastrySourceStatus }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
      {statusLabel(status)}
    </span>
  );
}

function PatternCard({ title, pattern }: { title: string; pattern: NatalInteractionPattern }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/15 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone-400">{title}</p>
        <SourceBadge status={pattern.sourceStatus} />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-amber-100">Casa {pattern.counterpartHouse} · {pattern.roleLabel}</h3>
      <div className="mt-3 grid gap-2 text-sm text-stone-300 sm:grid-cols-2">
        <p><strong className="text-stone-100">Regente I:</strong> {pattern.selfRuler}</p>
        <p><strong className="text-stone-100">Lua:</strong> significador secundário</p>
        <p><strong className="text-stone-100">Regente do papel:</strong> {pattern.counterpartRuler}</p>
        <p><strong className="text-stone-100">Tom operacional:</strong> {pattern.tone}</p>
      </div>
      <div className="mt-4 space-y-2 text-sm leading-6 text-stone-300">
        <p><strong className="text-stone-100">Regente I ↔ papel:</strong> {pattern.directAspect ? `${pattern.directAspect.aspect}, orbe ${pattern.directAspect.orb.toFixed(2)}°` : "sem aspecto direto"}.</p>
        <p><strong className="text-stone-100">Lua ↔ papel:</strong> {pattern.moonDirectAspect ? `${pattern.moonDirectAspect.aspect}, orbe ${pattern.moonDirectAspect.orb.toFixed(2)}°` : "sem aspecto direto"}.</p>
        <p><strong className="text-stone-100">Recepções:</strong> I→papel {pattern.selfToCounterpart.length}; papel→I {pattern.counterpartToSelf.length}; Lua→papel {pattern.moonToCounterpart.length}; papel→Lua {pattern.counterpartToMoon.length}.</p>
      </div>
      <details className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-200">Ver evidência natal deste papel</summary>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
          {pattern.evidence.map((item, index) => <li key={`${pattern.person}-${index}`}>• {item}</li>)}
        </ul>
      </details>
    </article>
  );
}

function ContactLine({ contact }: { contact: CrossAspectContact }) {
  return (
    <li className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-stone-300">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-stone-100">{contact.pointA} (A) {contact.aspect} {contact.pointB} (B)</strong>
        <SourceBadge status={contact.sourceStatus} />
      </div>
      <p className="mt-1 text-xs leading-5 text-stone-400">Orbe {contact.orb.toFixed(2)}° / máximo {contact.maxOrb.toFixed(2)}° · prioridade {contact.priority}.</p>
      <p className="mt-1 text-xs leading-5 text-stone-400">{contact.note}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-stone-500">Por que este contato é permitido?</summary>
        <p className="mt-1 text-xs leading-5 text-stone-500">{contact.sourceBasis}</p>
      </details>
    </li>
  );
}

function ReceptionLine({ reception }: { reception: CrossReception }) {
  return (
    <li className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-stone-300">
      <strong className="text-stone-100">{reception.actorPerson}:{reception.actorPlanet} → {reception.targetPerson}:{reception.targetPlanet}</strong> por {reception.by}
      <p className="mt-1 text-xs leading-5 text-stone-400">{reception.quality} · {reception.polarity} · prioridade {reception.priority}{reception.hasCrossAspect ? ` · também há ${reception.aspect} (${reception.orb?.toFixed(2)}°)` : " · sem aspecto concomitante"}.</p>
    </li>
  );
}

function SynthesisBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">{title}</p>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
          {items.map((item, index) => <li key={`${title}-${index}`}>• {item}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-stone-500">Nenhum testemunho materializado.</p>}
    </div>
  );
}

export default function TraditionalSynastryPanel({ analysis, report, aiPacket }: { analysis: SynastryAnalysis; report: string; aiPacket?: SynastryAIEvaluationPacket }) {
  const activeRole = analysis.roleResonance.filter((item) => item.present);
  const centralContacts = analysis.contacts.filter((item) => item.priority !== "supporting");
  const supportingContacts = analysis.contacts.filter((item) => item.priority === "supporting");
  const centralReceptions = analysis.receptions.filter((item) => item.priority !== "supporting");
  const supportingReceptions = analysis.receptions.filter((item) => item.priority === "supporting");
  const cuspContacts = analysis.contacts.filter((item) => item.pointAType === "cusp" || item.pointBType === "cusp");
  const presentGround = analysis.sharedGround.filter((item) => item.present);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // O conteúdo continua visível no painel para seleção manual.
    }
  };

  const copyAI = async () => {
    if (!aiPacket) return;
    await copyText(JSON.stringify(aiPacket, null, 2));
  };

  return (
    <section className="w-full space-y-6">
      <div className="western-glass rounded-[2rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Sinastria · Marcos/Frawley · v{analysis.methodVersion}</p>
            <h2 className="section-title mt-2 text-3xl font-semibold text-amber-100">Leitura por padrões natais de papel</h2>
            <p className="section-copy mt-3 max-w-5xl text-sm">
              <strong>{analysis.foundations.A.label}</strong> recebe <strong>{analysis.foundations.B.label}</strong> como {analysis.interactionContext.roleA} (casa {analysis.interactionContext.counterpartHouseForA}); no sentido inverso, A ocupa o papel de {analysis.interactionContext.roleB} (casa {analysis.interactionContext.counterpartHouseForB}).
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm ${analysis.calculationCompleteness.status === "complete" ? "border-white/10 bg-white/[0.04] text-stone-200" : "border-amber-300/20 bg-amber-950/20 text-amber-100"}`}>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-stone-400">Auditoria do cálculo</p>
            <p className="mt-1 font-semibold">{analysis.calculationCompleteness.status === "complete" ? "Pipeline mecânico completo" : "Pipeline com dados faltantes"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Encaixe dos padrões", analysis.synthesis.patternFit],
            ["Vínculo estrutural", analysis.synthesis.structuralBond],
            ["Capacidade de contato", analysis.synthesis.contactCapacity],
            ["Reciprocidade", analysis.synthesis.reciprocity],
            ["Temperamento", analysis.temperamentBond.status],
          ].map(([title, value]) => (
            <div key={title} className="rounded-2xl border border-amber-200/10 bg-black/20 p-4">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">{title}</p>
              <p className="mt-2 text-sm font-semibold capitalize text-amber-50">{metricLabel(value)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300"><strong className="text-amber-100">{analysis.calculationCompleteness.counts.roleCoreContacts}</strong> contatos centrais de papel</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300"><strong className="text-amber-100">{analysis.calculationCompleteness.counts.activeRoleResonances}</strong> ressonâncias de papel ativas</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300"><strong className="text-amber-100">{analysis.calculationCompleteness.counts.receptions}</strong> recepções cruzadas materializadas</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300"><strong className="text-amber-100">{analysis.calculationCompleteness.counts.antiscia}</strong> contatos por antíscio</div>
        </div>

        {analysis.calculationCompleteness.missing.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-950/20 p-4 text-sm text-amber-100">
            <strong>Dados que a IA não pode inventar:</strong> {analysis.calculationCompleteness.missing.join(" · ")}
          </div>
        )}
      </div>

      {(analysis.userContext.focus || analysis.userContext.relationshipState) && (
        <div className="western-glass rounded-[2rem] p-5 sm:p-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Contexto informado · não altera o cálculo</p>
          {analysis.userContext.focus && <p className="mt-3 text-sm leading-6 text-stone-300"><strong className="text-stone-100">Foco:</strong> {analysis.userContext.focus}</p>}
          {analysis.userContext.relationshipState && <p className="mt-2 text-sm leading-6 text-stone-300"><strong className="text-stone-100">Estado da relação:</strong> {analysis.userContext.relationshipState}</p>}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="western-glass rounded-[2rem] p-5 sm:p-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Temperamento · o porquê estrutural</p>
          <h3 className="mt-2 text-xl font-semibold capitalize text-amber-100">{metricLabel(analysis.temperamentBond.status)}</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
            {analysis.temperamentBond.axisRelations.map((axis) => <li key={axis.axis}>• {axis.axis}: A {axis.personA} × B {axis.personB} → {axis.relation}.</li>)}
            {analysis.temperamentBond.interpretationKey.map((item, index) => <li key={`temp-${index}`}>• {item}</li>)}
          </ul>
        </div>
        <div className="western-glass rounded-[2rem] p-5 sm:p-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Terreno comum</p>
          {presentGround.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
              {presentGround.map((item) => <li key={item.id} className="flex items-start gap-2"><SourceBadge status={item.sourceStatus} /><span>{item.description}</span></li>)}
            </ul>
          ) : <p className="mt-3 text-sm leading-6 text-stone-400">Nenhum dos testemunhos derivados do exemplo Newman/Woodward apareceu. Isso não equivale a incompatibilidade automática.</p>}
        </div>
      </div>


      <div className="grid gap-4 xl:grid-cols-2">
        <PatternCard title={`Padrão de ${analysis.foundations.A.label}`} pattern={analysis.interactionPatterns.A} />
        <PatternCard title={`Padrão de ${analysis.foundations.B.label}`} pattern={analysis.interactionPatterns.B} />
      </div>

      <div className="western-glass rounded-[2rem] p-5 sm:p-7">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Comparação antes dos contatos</p>
        <h3 className="mt-2 text-xl font-semibold capitalize text-amber-100">{metricLabel(analysis.interactionPatterns.comparison.status)}</h3>
        <p className="mt-3 text-sm leading-6 text-stone-300">{analysis.interactionPatterns.comparison.description}</p>
      </div>

      <div className="western-glass rounded-[2rem] p-5 sm:p-7">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Pessoa concreta ↔ papel natal</p>
        <h3 className="mt-2 text-xl font-semibold text-amber-100">Ressonâncias centrais</h3>
        {activeRole.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {activeRole.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-stone-100">{item.title}</strong><SourceBadge status={item.sourceStatus} /></div>
                <p className="mt-2 text-xs leading-5 text-stone-400">{item.description}</p>
              </article>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-stone-400">Nenhuma ressonância central por contato ou recepção foi materializada. O motor não força uma ligação.</p>}
      </div>

      <div className="western-glass rounded-[2rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Contatos · o como</p>
            <h3 className="mt-2 text-xl font-semibold text-amber-100">Aspectos cruzados centrais</h3>
          </div>
          <p className="text-xs text-stone-500">Aplicação/separação entre nascimentos: não calculada por princípio.</p>
        </div>
        {centralContacts.length ? <ul className="mt-4 grid gap-3 lg:grid-cols-2">{centralContacts.map((item) => <ContactLine key={item.id} contact={item} />)}</ul> : <p className="mt-4 text-sm text-stone-400">Nenhum contato role-core/core dentro dos orbes tradicionais.</p>}
        {supportingContacts.length > 0 && (
          <details className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-stone-200">Ver {supportingContacts.length} contatos de apoio</summary>
            <ul className="mt-3 grid gap-3 lg:grid-cols-2">{supportingContacts.map((item) => <ContactLine key={item.id} contact={item} />)}</ul>
          </details>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="western-glass rounded-[2rem] p-5 sm:p-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Recepção · intenção/interesse</p>
          <h3 className="mt-2 text-xl font-semibold text-amber-100">Recepções centrais</h3>
          {centralReceptions.length ? <ul className="mt-4 space-y-3">{centralReceptions.map((item) => <ReceptionLine key={item.id} reception={item} />)}</ul> : <p className="mt-3 text-sm text-stone-400">Nenhuma recepção central materializada.</p>}
          {supportingReceptions.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm text-stone-300">Ver {supportingReceptions.length} recepções de apoio</summary><ul className="mt-3 space-y-3">{supportingReceptions.map((item) => <ReceptionLine key={item.id} reception={item} />)}</ul></details>}
        </div>
        <div className="western-glass rounded-[2rem] p-5 sm:p-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-stone-400">Áreas tocadas</p>
          <h3 className="mt-2 text-xl font-semibold text-amber-100">Planeta ↔ cúspide</h3>
          {cuspContacts.length ? (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-300">
              {cuspContacts.map((item) => <li key={`cusp-${item.id}`}>• {item.pointA} (A) {item.aspect} {item.pointB} (B), {item.orb.toFixed(2)}° <SourceBadge status={item.sourceStatus} /></li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-stone-400">Nenhuma cúspide recebeu aspecto cruzado dentro do orbe.</p>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SynthesisBlock title="Forças disponíveis" items={analysis.synthesis.strengths} />
        <SynthesisBlock title="Tensões" items={analysis.synthesis.tensions} />
        <SynthesisBlock title="Assimetrias" items={analysis.synthesis.asymmetries} />
        <SynthesisBlock title="Potencial formativo" items={analysis.synthesis.growthPotential} />
        <SynthesisBlock title="Por quê" items={analysis.synthesis.why} />
        <SynthesisBlock title="Como" items={analysis.synthesis.how} />
      </div>

      <details className="western-glass rounded-[2rem] p-5 sm:p-6">
        <summary className="cursor-pointer text-sm font-semibold text-amber-100">Limites, lacunas documentais e cautelas</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SynthesisBlock title="Limites do cálculo" items={analysis.synthesis.limits} />
          <SynthesisBlock title="Questões bloqueadas pelas fontes" items={analysis.unresolvedTechnicalQuestions} />
          <SynthesisBlock title="Cautelas" items={analysis.cautions} />
          <SynthesisBlock title="Notas de fonte" items={analysis.sourceNotes} />
        </div>
      </details>

      <details className="traditional-report-shell overflow-hidden rounded-[2rem]">
        <summary className="cursor-pointer border-b border-stone-300/70 px-6 py-5 text-sm font-semibold text-slate-900 sm:px-8">
          Relatório técnico integral · para auditoria
        </summary>
        <div className="px-6 pt-5 sm:px-8">
          <button type="button" onClick={() => copyText(report)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800">
            Copiar relatório completo
          </button>
        </div>
        <pre className="traditional-report-text max-h-[78vh] overflow-auto whitespace-pre-wrap px-6 py-6 font-mono text-[12px] leading-6 sm:px-8 sm:text-[13px]">
          {report}
        </pre>
      </details>

      {aiPacket && (
        <details className="traditional-report-shell overflow-hidden rounded-[2rem]">
          <summary className="cursor-pointer border-b border-stone-300/70 px-6 py-5 text-sm font-semibold text-slate-900 sm:px-8">
            Pacote estruturado para IA · sem recálculo
          </summary>
          <div className="px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-3xl text-sm text-slate-600">JSON canônico com auditoria de completude, dados, testemunhos, síntese mecânica, incertezas e contexto. Campo ausente permanece MISSING_ENGINE_DATA.</p>
              <button type="button" onClick={copyAI} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800">
                Copiar pacote para IA
              </button>
            </div>
            <pre className="traditional-report-text mt-4 max-h-[78vh] overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-6 sm:text-[13px]">
              {JSON.stringify(aiPacket, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </section>
  );
}
