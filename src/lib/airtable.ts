const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_URL = 'https://api.airtable.com/v0';

const TABLE_IDS: Record<string, string> = {
  USERS: 'Users',
  PRODUKTE: 'tbl8Qto6jldltw6Yr',
  AARTAPPEL_PROGRAMME: 'tblOnHbrGX53dI2wa',
  AARTAPPEL_PROGRAMME_GAS: 'tbl5CJAP295lmSFQq',
  AARTAPPEL_PRODUCTS: 'tbluCOhz8aGsHRSmd',
  POTATO_REQUIREMENTS: 'tbl0aqqc2qdFRxxpb',
  SOJA_BESPROEING: 'tblHYXRZXzGegJZhq',
  SOJA_DROELAND: 'tbluy7vBiHSr6kVBC',
  SOJA_PRODUCTS: 'tblAuVd0zXOHcaknn',
  MIELIES_BESPROEING: 'tblAsIZxCs0o9BlTZ',
  MIELIES_BESPROEING_OP2: 'tblyg5PybKJpeIh2V',
  MIELIES_DROELAND: 'tblTScoSK0B6ncMCA',
  MIELIES_PRODUCTS: 'tbl04eTWcGPEkulZO',
  SUIKERBONE: 'tblgbbV6AhM4SEtZZ',
  SUIKERBONE_PRODUCTS: 'tbl8Qto6jldltw6Yr',
  RCN_PROGRAM: 'tblmODtx4tk5ZLKVI',
  TRAINING: 'Training',
  DEPARTMENTS: 'Departments',
  TRAINING_PROGRESS: 'Training Progress',
  BLENDING_ORDERS: 'Blending Orders',
  BLEND_RECIPES: 'Blend Recipes',
  FARMS: 'Farms',
  FIELDS: 'Fields',
  SOIL_SAMPLES: 'Soil Samples',
  LEAF_SAMPLES: 'Leaf Samples',
  PROGRAMS: 'Programs',
  FIELD_VISITS: 'Field Visits',
  TRIALS: 'Trials',
  DECISIONS: 'Decisions',
  FARMERS: 'Farmers',
  WAREHOUSES: 'Warehouses',
  INVENTORY: 'Inventory',
  ORDERS: 'Orders',
  STOCK_TAKES: 'Stock Takes',
  MESSAGES: 'Messages',
  NOTIFICATIONS: 'Notifications',
  TASKS: 'Tasks',
};

export function getTableId(key: string): string {
  return TABLE_IDS[key] || key;
}

interface AtListOptions {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
  fields?: string[];
  pageSize?: number;
  offset?: string;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(endpoint)}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function atList(table: string, opts: AtListOptions = {}): Promise<AirtableResponse> {
  const tableId = TABLE_IDS[table] || table;
  const params = new URLSearchParams();
  if (opts.filterByFormula) params.set('filterByFormula', opts.filterByFormula);
  if (opts.maxRecords) params.set('maxRecords', String(opts.maxRecords));
  if (opts.pageSize) params.set('pageSize', String(opts.pageSize));
  if (opts.offset) params.set('offset', opts.offset);
  if (opts.sort) {
    opts.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (opts.fields) {
    opts.fields.forEach(f => params.append('fields[]', f));
  }
  const qs = params.toString();
  const url = `${API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable error ${res.status}: ${err}`);
  }
  return res.json() as Promise<AirtableResponse>;
}

export async function atCreate(table: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
  const tableId = TABLE_IDS[table] || table;
  const res = await request(tableId, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return res as AirtableRecord;
}

export async function atUpdate(table: string, recordId: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
  const tableId = TABLE_IDS[table] || table;
  const url = `${API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable update error: ${res.status}`);
  return res.json();
}

export async function atDelete(table: string, recordId: string): Promise<void> {
  const tableId = TABLE_IDS[table] || table;
  const url = `${API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}/${recordId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable delete error: ${res.status}`);
}

export async function getSoilSamplesByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Soil Samples', {});
  return res.records.filter((r) => {
    const farmField = r.fields['Farm'] as string[] | undefined;
    return Array.isArray(farmField) && farmField.includes(farmId);
  });
}

export async function getLeafSamplesByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Leaf Samples', {});
  return res.records.filter((r) => {
    const farmField = r.fields['Farm'] as string[] | undefined;
    return Array.isArray(farmField) && farmField.includes(farmId);
  });
}

export async function getProgramsByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Programs', {});
  return res.records.filter((r) => {
    const fields = r.fields['Fields'] as string[] | undefined;
    return Array.isArray(fields) && fields.length > 0;
  });
}

export async function getFieldVisitsByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Field Visits', {});
  return res.records.filter((r) => {
    const farmField = r.fields['Farm'] as string[] | undefined;
    return Array.isArray(farmField) && farmField.includes(farmId);
  });
}

export async function getTrialsByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Trials', {});
  return res.records.filter((r) => {
    const farmField = r.fields['Farm'] as string[] | undefined;
    return Array.isArray(farmField) && farmField.includes(farmId);
  });
}

export async function getDecisionsByFarm(farmId: string): Promise<AirtableRecord[]> {
  const res = await atList('Decisions', {});
  return res.records.filter((r) => {
    const farmField = r.fields['Farm'] as string[] | undefined;
    return Array.isArray(farmField) && farmField.includes(farmId);
  });
}
