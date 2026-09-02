import { circularDistance, normalize360 } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictivePoint, PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import type { MundaneInterChartContact, MundaneRelationEdge } from "./mundaneTypes";

const GATE=2;
const ASPECTS=[{name:"conjunction",angle:0},{name:"sextile",angle:60},{name:"square",angle:90},{name:"trine",angle:120},{name:"opposition",angle:180}] as const;

export interface MundaneChartNode {id:string;sky:PredictiveSkySnapshot;role:string}
function sameSign(a:number,b:number){return Math.floor(normalize360(a)/30)===Math.floor(normalize360(b)/30);}
function points(s:PredictiveSkySnapshot):PredictivePoint[]{return [...s.planets,...s.angles,...s.cusps];}
function antiscion(longitude:number){return normalize360(180-longitude);}

function contactsForEdge(edge:MundaneRelationEdge,from:MundaneChartNode,to:MundaneChartNode):MundaneInterChartContact[]{
  const out:MundaneInterChartContact[]=[];
  for(const a of points(from.sky)) for(const b of points(to.sky)){
    const sep=circularDistance(a.longitude,b.longitude);
    for(const asp of ASPECTS){
      const d=Math.abs(sep-asp.angle); if(d>GATE) continue;
      const cuspConj=asp.name==="conjunction"&&(a.kind==="cusp"||b.kind==="cusp");
      const gate=cuspConj?sameSign(a.longitude,b.longitude):true;
      out.push({fromChartId:edge.from,fromPoint:a.name,toChartId:edge.to,toPoint:b.name,aspect:asp.name,distanceToExact:d,sameSignGate:cuspConj?gate:undefined,materialized:gate,operationalGateDeg:GATE,gateProvenance:"ENGINE_SCREENING_NOT_AUTHORIAL_ORB"});
    }
    const antiDist=circularDistance(antiscion(a.longitude),b.longitude);
    if(antiDist<=GATE) out.push({fromChartId:edge.from,fromPoint:`${a.name} (antíscio)`,toChartId:edge.to,toPoint:b.name,aspect:"antiscion-conjunction",distanceToExact:antiDist,sameSignGate:sameSign(antiscion(a.longitude),b.longitude),materialized:sameSign(antiscion(a.longitude),b.longitude),operationalGateDeg:GATE,gateProvenance:"ENGINE_SCREENING_NOT_AUTHORIAL_ORB"});
    const contraDist=circularDistance(normalize360(antiscion(a.longitude)+180),b.longitude);
    if(contraDist<=GATE) out.push({fromChartId:edge.from,fromPoint:`${a.name} (contra-antíscio)`,toChartId:edge.to,toPoint:b.name,aspect:"contra-antiscion-opposition",distanceToExact:contraDist,materialized:true,operationalGateDeg:GATE,gateProvenance:"ENGINE_SCREENING_NOT_AUTHORIAL_ORB"});
  }
  return out.filter(x=>x.materialized).sort((x,y)=>x.distanceToExact-y.distanceToExact);
}

export function buildMundaneRelations(args:{radixIds:string[];eclipseIds:string[];relatedRadixIds?:Array<[string,string]>}):MundaneRelationEdge[]{
  const edges:MundaneRelationEdge[]=[
    {from:"process-grand-conjunction",to:"governing-aries-ingress",type:"contains",reason:"annual layer read inside governing chronocrator process"},
    {from:"governing-aries-ingress",to:"target",type:"contains",reason:"target lies inside governing Aries year"},
  ];
  for(const e of args.eclipseIds){
    edges.push({from:"process-grand-conjunction",to:e,type:"refines",reason:"eclipse read against larger cycle"});
    edges.push({from:"governing-aries-ingress",to:e,type:"refines",reason:"eclipse read against annual layer"});
  }
  for(const r of args.radixIds){
    edges.push({from:"process-grand-conjunction",to:r,type:"localizes-to-radix",reason:"larger cycle localized to historical radix"});
    edges.push({from:"governing-aries-ingress",to:r,type:"localizes-to-radix",reason:"annual layer localized to historical radix"});
    for(const e of args.eclipseIds) edges.push({from:e,to:r,type:"localizes-to-radix",reason:"eclipse localized to historical radix"});
    edges.push({from:"target",to:r,type:"activates-radix",reason:"target-date trigger tested against historical radix"});
  }
  for(const [a,b] of args.relatedRadixIds??[]) if(args.radixIds.includes(a)&&args.radixIds.includes(b)) edges.push({from:a,to:b,type:"inter-polity",reason:"explicit user-declared relation between historical entities"});
  return edges;
}

export function materializeRelationContacts(edges:MundaneRelationEdge[],nodes:MundaneChartNode[]):MundaneInterChartContact[]{
  const map=new Map(nodes.map(n=>[n.id,n])); const out:MundaneInterChartContact[]=[];
  for(const edge of edges){const a=map.get(edge.from),b=map.get(edge.to);if(a&&b)out.push(...contactsForEdge(edge,a,b));}
  return out;
}
