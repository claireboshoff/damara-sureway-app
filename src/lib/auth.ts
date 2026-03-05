import { atList, atCreate, atUpdate, atDelete } from './airtable';

export type UserRole = 'farmer' | 'agent' | 'admin' | 'management' | 'supplier' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

function esc(v: string) {
  return (v || '').replace(/'/g, "\\'");
}

export async function signIn(email: string, password: string): Promise<Profile> {
  const response = await atList('Users', {
    filterByFormula: `LOWER({Email}) = LOWER('${esc(email)}')`,
  });
  const records = response.records || [];
  if (records.length === 0) throw new Error('Invalid email or password');

  const record = records[0];
  const fields = record.fields;
  const storedPassword = fields.Password as string;

  if (!storedPassword) throw new Error('Invalid email or password');

  let match = false;
  if (storedPassword.startsWith('base64:')) {
    match = atob(storedPassword.replace('base64:', '')) === password;
  } else {
    match = storedPassword === password;
  }
  if (!match) throw new Error('Invalid email or password');

  const role = resolveRole(fields);
  const profile: Profile = {
    id: record.id,
    email: fields.Email as string,
    full_name: (fields['Full Name'] as string) || '',
    phone: ((fields.Phone || fields.Contact) as string) || '',
    address: (fields.Address as string) || '',
    role,
    is_active: fields.Active !== false,
    created_at: (fields.Created as string) || new Date().toISOString(),
  };

  localStorage.setItem('damara_session', JSON.stringify({ userId: profile.id, email: profile.email }));
  localStorage.setItem('damara_profile', JSON.stringify(profile));
  return profile;
}

export async function signUp(
  email: string,
  password: string,
  full_name: string,
  phone = '',
  role: UserRole = 'farmer',
): Promise<Profile> {
  const existing = await atList('Users', {
    filterByFormula: `LOWER({Email}) = LOWER('${esc(email)}')`,
  });
  if ((existing.records || []).length > 0) throw new Error('Email already registered');

  const created = await atCreate('Users', {
    Email: email,
    Password: 'base64:' + btoa(password),
    'Full Name': full_name,
    Farmer: role === 'farmer',
    Agent: role === 'agent',
    Management: role === 'admin' || role === 'management',
  });

  const profile: Profile = {
    id: created.id,
    email,
    full_name,
    phone,
    address: '',
    role,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  localStorage.setItem('damara_session', JSON.stringify({ userId: profile.id, email: profile.email }));
  localStorage.setItem('damara_profile', JSON.stringify(profile));
  return profile;
}

export function signOut() {
  localStorage.removeItem('damara_session');
  localStorage.removeItem('damara_profile');
}

export function getCurrentProfile(): Profile | null {
  const str = localStorage.getItem('damara_profile');
  if (!str) return null;
  try {
    return JSON.parse(str) as Profile;
  } catch {
    localStorage.removeItem('damara_session');
    localStorage.removeItem('damara_profile');
    return null;
  }
}

export async function getAllUsers(): Promise<Profile[]> {
  const res = await atList('Users', {});
  return (res.records || []).map((r) => {
    const f = r.fields;
    return {
      id: r.id,
      email: f.Email as string,
      full_name: (f['Full Name'] as string) || '',
      phone: ((f.Phone || f.Contact) as string) || '',
      address: (f.Address as string) || '',
      role: resolveRole(f),
      is_active: f.Active !== false,
      created_at: (f.Created as string) || '',
    };
  });
}

export async function updateProfile(userId: string, updates: Partial<Profile> & { password?: string }) {
  const fields: Record<string, unknown> = {};
  if (updates.email) fields.Email = updates.email;
  if (updates.full_name) fields['Full Name'] = updates.full_name;
  if (updates.role) {
    fields.Farmer = updates.role === 'farmer';
    fields.Agent = updates.role === 'agent';
    fields.Management = updates.role === 'admin' || updates.role === 'management';
  }
  if (updates.password) fields.Password = 'base64:' + btoa(updates.password);
  await atUpdate('Users', userId, fields);

  const current = getCurrentProfile();
  if (current && current.id === userId) {
    const updated = { ...current, ...updates };
    delete (updated as Record<string, unknown>).password;
    localStorage.setItem('damara_profile', JSON.stringify(updated));
  }
}

export async function deleteUser(userId: string) {
  await atDelete('Users', userId);
}

function resolveRole(fields: Record<string, unknown>): UserRole {
  if (fields.Role) return fields.Role as UserRole;
  if (fields.Management) return 'management';
  if (fields.Agent || fields['Warehouse Agent']) return 'agent';
  return 'farmer';
}
