import { atList, atCreate, type AirtableRecord } from './airtable';

export interface Farmer {
  id: string;
  'Farmer Name'?: string;
  'Phone Number'?: string;
  Email?: string;
  'Region / Area'?: string;
  Farms?: string[];
  'Assigned Agent'?: string[];
  [key: string]: unknown;
}

export interface Farm {
  id: string;
  'Farm Name'?: string;
  Farmer?: string[];
  'Farm Size (ha)'?: number;
  Location?: string;
  GPS?: string;
  Fields?: string[];
  [key: string]: unknown;
}

export interface Field {
  id: string;
  'Field Name'?: string;
  Farm?: string[];
  'Field Size (ha)'?: number;
  'Crop Type'?: string;
  [key: string]: unknown;
}

function toFarmer(r: AirtableRecord): Farmer {
  return { id: r.id, ...r.fields } as Farmer;
}

function toFarm(r: AirtableRecord): Farm {
  return { id: r.id, ...r.fields } as Farm;
}

function toField(r: AirtableRecord): Field {
  return { id: r.id, ...r.fields } as Field;
}

export async function listFarmers(filter?: string): Promise<Farmer[]> {
  const res = await atList('Farmers', filter ? { filterByFormula: filter } : {});
  return (res.records || []).map(toFarmer);
}

export async function getOrCreateFarmerByEmail(email: string, name: string): Promise<Farmer> {
  const esc = (v: string) => v.replace(/'/g, "\\'");
  const res = await atList('Farmers', {
    filterByFormula: `LOWER({Email}) = LOWER('${esc(email)}')`,
  });
  if (res.records.length > 0) return toFarmer(res.records[0]);

  const created = await atCreate('Farmers', {
    'Farmer Name': name,
    Email: email,
  });
  return toFarmer(created);
}

export async function listFarms(filter?: string): Promise<Farm[]> {
  const res = await atList('Farms', filter ? { filterByFormula: filter } : {});
  return (res.records || []).map(toFarm);
}

export async function listFields(filter?: string): Promise<Field[]> {
  const res = await atList('Fields', filter ? { filterByFormula: filter } : {});
  return (res.records || []).map(toField);
}

export async function listSoilSamples(filter?: string) {
  const res = await atList('Soil Samples', filter ? { filterByFormula: filter } : {});
  return res.records || [];
}

export async function listLeafSamples(filter?: string) {
  const res = await atList('Leaf Samples', filter ? { filterByFormula: filter } : {});
  return res.records || [];
}

export async function listPrograms(filter?: string) {
  const res = await atList('Programs', filter ? { filterByFormula: filter } : {});
  return res.records || [];
}

export async function listFieldVisits(filter?: string) {
  const res = await atList('Field Visits', filter ? { filterByFormula: filter } : {});
  return res.records || [];
}

export async function listTrials(filter?: string) {
  const res = await atList('Trials', filter ? { filterByFormula: filter } : {});
  return res.records || [];
}
