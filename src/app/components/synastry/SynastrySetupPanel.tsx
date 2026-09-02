"use client";

import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import {
  SYNASTRY_INTERACTION_PRESETS,
  type SynastryCustomRoleInput,
  type SynastryInteractionKind,
  type SynastryUserContext,
} from "@/traditions/western/synastry";
import PresavedChartsDropdown from "../charts/PresavedChartsDropdown";

const HOUSE_LABELS = [
  "1 · pessoa / eu",
  "2 · bens / recursos",
  "3 · irmãos / alunos / rotina próxima",
  "4 · pai / raízes / lar",
  "5 · filhos / prazer / sexo",
  "6 · subordinados / serviço / doença",
  "7 · parceiro / sócio / outra pessoa",
  "8 · morte / bens do outro",
  "9 · mestre / professor / fé / saber superior",
  "10 · mãe / chefe / autoridade / carreira",
  "11 · amigos / dádivas",
  "12 · inimigos ocultos / autossabotagem",
] as const;

interface SynastrySetupPanelProps {
  personA?: BirthChartProfile;
  personB?: BirthChartProfile;
  interactionKind: SynastryInteractionKind;
  customRole: SynastryCustomRoleInput;
  userContext: SynastryUserContext;
  loading: boolean;
  error?: string;
  onPersonA: (profile: BirthChartProfile) => void;
  onPersonB: (profile: BirthChartProfile) => void;
  onInteractionKind: (kind: SynastryInteractionKind) => void;
  onCustomRole: (value: SynastryCustomRoleInput) => void;
  onUserContext: (value: SynastryUserContext) => void;
  onSwap: () => void;
  onSubmit: () => void;
}

function profileValue(profile?: BirthChartProfile): string {
  return profile?.id ?? profile?.name ?? "";
}

export default function SynastrySetupPanel({
  personA,
  personB,
  interactionKind,
  customRole,
  userContext,
  loading,
  error,
  onPersonA,
  onPersonB,
  onInteractionKind,
  onCustomRole,
  onUserContext,
  onSwap,
  onSubmit,
}: SynastrySetupPanelProps) {
  const selected = SYNASTRY_INTERACTION_PRESETS.find((item) => item.kind === interactionKind);
  const ready = Boolean(personA?.birthDate && personB?.birthDate);
  const sameProfile = Boolean(ready && profileValue(personA) && profileValue(personA) === profileValue(personB));
  const customValid = interactionKind !== "custom" || (
    Number.isInteger(customRole.houseForA) && customRole.houseForA >= 1 && customRole.houseForA <= 12 &&
    Number.isInteger(customRole.houseForB) && customRole.houseForB >= 1 && customRole.houseForB <= 12 &&
    customRole.roleA.trim().length > 0 && customRole.roleB.trim().length > 0
  );

  const groups = [...new Set(SYNASTRY_INTERACTION_PRESETS.map((item) => item.group))];

  return (
    <section className="western-glass w-full rounded-[2rem] p-5 sm:p-7" aria-labelledby="synastry-setup-title">
      <p className="section-eyebrow">Sinastria tradicional · fluxo guiado</p>
      <h2 id="synastry-setup-title" className="section-title mt-2 text-2xl font-semibold text-amber-100">
        Compare os padrões certos antes dos contatos
      </h2>
      <p className="section-copy mt-3 text-sm">
        O papel é parte do cálculo: professor–aluno, amizade, casamento e relação profissional não usam automaticamente a mesma casa. Primeiro escolha as duas pessoas e diga o que elas são uma para a outra.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">1 · Pessoa A</span>
          <PresavedChartsDropdown
            value={profileValue(personA)}
            placeholder="Selecione a Pessoa A"
            ariaLabel="Pessoa A da sinastria"
            disabled={loading}
            onChange={onPersonA}
          />
        </label>

        <button
          type="button"
          onClick={onSwap}
          disabled={!personA || !personB || loading}
          className="rounded-xl border border-amber-200/20 px-4 py-2 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Trocar A e B preservando a direção correta do papel"
        >
          Trocar A ↔ B
        </button>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">2 · Pessoa B</span>
          <PresavedChartsDropdown
            value={profileValue(personB)}
            placeholder="Selecione a Pessoa B"
            ariaLabel="Pessoa B da sinastria"
            disabled={loading}
            onChange={onPersonB}
          />
        </label>
      </div>

      {sameProfile && (
        <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          A e B apontam para o mesmo perfil. Isso é permitido para auditoria, mas normalmente você deve escolher duas pessoas diferentes.
        </p>
      )}

      <div className="mt-6 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400" htmlFor="synastry-interaction-kind">
          3 · Qual é o vínculo concreto?
        </label>
        <select
          id="synastry-interaction-kind"
          value={interactionKind}
          disabled={loading}
          onChange={(event) => onInteractionKind(event.target.value as SynastryInteractionKind)}
          className="w-full rounded-xl border border-amber-300/20 bg-[#0a0f24] px-3 py-3 text-sm text-stone-100 outline-none"
        >
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {SYNASTRY_INTERACTION_PRESETS.filter((item) => item.group === group).map((item) => (
                <option key={item.kind} value={item.kind}>{item.label}</option>
              ))}
            </optgroup>
          ))}
          <optgroup label="Avançado">
            <option value="custom">Papéis personalizados · escolher casas manualmente</option>
          </optgroup>
        </select>

        {selected && (
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-stone-300 md:grid-cols-2">
            <p><strong className="text-amber-100">No mapa de A:</strong> B entra como {selected.roleA}, casa {selected.houseA}.</p>
            <p><strong className="text-amber-100">No mapa de B:</strong> A entra como {selected.roleB}, casa {selected.houseB}.</p>
          </div>
        )}
      </div>

      {interactionKind === "custom" && (
        <div className="mt-4 rounded-2xl border border-amber-200/15 bg-black/20 p-4">
          <p className="text-sm font-semibold text-amber-100">Modo avançado de papéis</p>
          <p className="mt-1 text-xs leading-5 text-stone-400">
            Use apenas quando o vínculo não couber nos presets. A escolha das casas fica registrada como derivação do usuário; o motor não inventa a casa por você.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm text-stone-300">
                No mapa de A, B é…
                <input
                  value={customRole.roleA}
                  onChange={(e) => onCustomRole({ ...customRole, roleA: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
                  placeholder="ex.: cliente B"
                />
              </label>
              <label className="block text-sm text-stone-300">
                Casa correspondente em A
                <select
                  value={customRole.houseForA}
                  onChange={(e) => onCustomRole({ ...customRole, houseForA: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
                >
                  {HOUSE_LABELS.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-stone-300">
                No mapa de B, A é…
                <input
                  value={customRole.roleB}
                  onChange={(e) => onCustomRole({ ...customRole, roleB: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
                  placeholder="ex.: consultor A"
                />
              </label>
              <label className="block text-sm text-stone-300">
                Casa correspondente em B
                <select
                  value={customRole.houseForB}
                  onChange={(e) => onCustomRole({ ...customRole, houseForB: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
                >
                  {HOUSE_LABELS.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">4 · Contexto opcional para a IA</p>
        <label className="block text-sm text-stone-300">
          O que você quer entender nesta relação?
          <textarea
            value={userContext.focus ?? ""}
            onChange={(e) => onUserContext({ ...userContext, focus: e.target.value })}
            rows={2}
            maxLength={2000}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
            placeholder="Ex.: onde surgem as principais dificuldades de comunicação e o que sustenta o vínculo?"
          />
        </label>
        <label className="block text-sm text-stone-300">
          Estado atual da relação
          <input
            value={userContext.relationshipState ?? ""}
            onChange={(e) => onUserContext({ ...userContext, relationshipState: e.target.value })}
            maxLength={2000}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2"
            placeholder="Ex.: casamento de 8 anos; sociedade recém-iniciada; relação professor–aluno encerrada"
          />
        </label>
        <details className="rounded-2xl border border-white/10 bg-black/15 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-stone-300">Notas adicionais para a interpretação</summary>
          <textarea
            value={userContext.notes ?? ""}
            onChange={(e) => onUserContext({ ...userContext, notes: e.target.value })}
            rows={3}
            maxLength={4000}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-3 py-2 text-sm text-stone-200"
            placeholder="Contexto factual relevante. Não muda nenhum cálculo e não deve ser usado pela IA para inventar testemunhos astrológicos."
          />
        </details>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-stone-400">
        <strong className="text-stone-200">Limite do método:</strong> sinastria estática descreve padrões, recursos, tensões e modos de conexão. Ela não determina sozinha quando as pessoas se encontram, quanto a relação dura ou quando termina.
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl border border-red-300/20 bg-red-950/20 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!ready || !customValid || loading}
        className="default-btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Calculando os dois mapas e a sinastria…" : "Calcular sinastria completa"}
      </button>
    </section>
  );
}
