
// Frontend API Client
const API_URL = 'http://localhost:3001/api/v1';
const TENANT_ID = 'd8429730-2222-4444-8888-666666666666'; // Static for demo

const headers = {
  'Content-Type': 'application/json',
  'x-tenant-id': TENANT_ID,
  // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment when Auth is fully integrated
};

export const api = {
  admin: {
    getSettings: async () => {
      const res = await fetch(`${API_URL}/admin/settings`, { headers });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
    updateSettings: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/settings`, { 
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      return res.json();
    },
    getBranches: async () => {
      const res = await fetch(`${API_URL}/admin/branches`, { headers });
      return res.json();
    },
    saveBranch: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/branches`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return res.json();
    },
    getUsers: async () => {
      const res = await fetch(`${API_URL}/admin/users`, { headers });
      return res.json();
    },
    saveUser: async (data: any) => {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return res.json();
    }
  }
};
