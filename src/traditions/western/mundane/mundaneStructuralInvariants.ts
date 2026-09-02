export type MundaneChartKind = "solar-eclipse" | "lunar-eclipse" | "solar-ingress" | "ordinary";
export interface MundaneStructuralInvariant {
  key: string;
  structuralByDefinition: true;
  independentTestimony: false;
  reason: string;
}

/** Contacts that arise from the very definition/geometry of a chart must not be
 * counted again as independent astrological testimony. */
export function structuralInvariantsForChart(kind:MundaneChartKind):MundaneStructuralInvariant[]{
  if(kind==="solar-eclipse") return [
    {key:"sun-moon-conjunction",structuralByDefinition:true,independentTestimony:false,reason:"solar_eclipse_geometry"},
    {key:"fortune-ascendant",structuralByDefinition:true,independentTestimony:false,reason:"fortune_formula_at_solar_syzygy"},
  ];
  if(kind==="lunar-eclipse") return [
    {key:"sun-moon-opposition",structuralByDefinition:true,independentTestimony:false,reason:"lunar_eclipse_geometry"},
    {key:"fortune-descendant",structuralByDefinition:true,independentTestimony:false,reason:"fortune_formula_at_lunar_syzygy"},
  ];
  if(kind==="solar-ingress") return [
    {key:"sun-at-ingress-degree",structuralByDefinition:true,independentTestimony:false,reason:"solar_ingress_definition"},
  ];
  return [];
}
