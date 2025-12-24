
// Frontend API Client
// Note: localhost:3001 is for local development only. 
// For demo environments, this will fall back gracefully.
const API_URL = 'http://localhost:3001/api/v1';
const TENANT_ID = 'd8429730-2222-4444-8888-666666666666'; 

const headers = {
  'Content-Type': 'application/json',
  'x-tenant-id': TENANT_ID,
};

/**
 * Robust fetch wrapper that handles network errors without crashing
 */
const safeFetch = async (url: string, options: any) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
       console.warn(`Local API Error: ${res.status} at ${url}`);
       return { error: true, status: res.status };
    }
    return res.json();
  } catch (err) {
    console.warn(`Failed to fetch from ${url}. Local server might be offline.`);
    return { error: true, message: "Server unreachable" };
  }
};

export const api = {
  admin: {
    getSettings: () => safeFetch(`${API_URL}/admin/settings`, { headers }),
    updateSettings: (data: any) => safeFetch(`${API_URL}/admin/settings`, { 
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
    }),
    getBranches: () => safeFetch(`${API_URL}/admin/branches`, { headers }),
    saveBranch: (data: any) => safeFetch(`${API_URL}/admin/branches`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }),
    getUsers: () => safeFetch(`${API_URL}/admin/users`, { headers }),
    saveUser: (data: any) => safeFetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    })
  }
};
