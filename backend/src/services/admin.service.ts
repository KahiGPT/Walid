
import pool from '../db/pool';

export class AdminService {
  
  // --- GENERAL SETTINGS ---
  static async getSettings(tenantId: string) {
    const query = `
      SELECT 
        restaurant_name as "restaurantName",
        branch_name as "branchName",
        currency,
        tax_rate as "taxRate",
        service_charge as "serviceCharge",
        print_language as "printLanguage"
      FROM general_settings 
      WHERE tenant_id = $1
    `;
    const res = await pool.query(query, [tenantId]);
    return res.rows[0];
  }

  static async updateSettings(tenantId: string, data: any) {
    const query = `
      INSERT INTO general_settings (tenant_id, restaurant_name, branch_name, currency, tax_rate, service_charge, print_language)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id) DO UPDATE SET
        restaurant_name = EXCLUDED.restaurant_name,
        branch_name = EXCLUDED.branch_name,
        currency = EXCLUDED.currency,
        tax_rate = EXCLUDED.tax_rate,
        service_charge = EXCLUDED.service_charge,
        print_language = EXCLUDED.print_language,
        updated_at = NOW()
      RETURNING *
    `;
    const res = await pool.query(query, [
      tenantId, 
      data.restaurantName, 
      data.branchName, 
      data.currency, 
      data.taxRate, 
      data.serviceCharge, 
      data.printLanguage
    ]);
    return res.rows[0];
  }

  // --- BRANCHES ---
  static async getBranches(tenantId: string) {
    const query = `
      SELECT 
        id, name, type, currency, 
        tax_rate as "taxRate" 
      FROM branches 
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY created_at ASC
    `;
    const res = await pool.query(query, [tenantId]);
    return res.rows;
  }

  static async upsertBranch(tenantId: string, branch: any) {
    // If ID exists and starts with 'b-' (from frontend mock), we treat as new insert DB will gen UUID
    // If ID is a UUID, we update.
    
    // For simplicity in this hybrid phase, we always Insert if it looks like a temp ID, or Update if UUID.
    const isNew = branch.id.startsWith('b-');

    if (isNew) {
      const query = `
        INSERT INTO branches (tenant_id, name, type, currency, tax_rate)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, type, currency, tax_rate as "taxRate"
      `;
      const res = await pool.query(query, [tenantId, branch.name, branch.type, branch.currency, branch.taxRate]);
      return res.rows[0];
    } else {
      const query = `
        UPDATE branches 
        SET name = $2, type = $3, currency = $4, tax_rate = $5
        WHERE id = $6 AND tenant_id = $1
        RETURNING id, name, type, currency, tax_rate as "taxRate"
      `;
      const res = await pool.query(query, [tenantId, branch.name, branch.type, branch.currency, branch.taxRate, branch.id]);
      return res.rows[0];
    }
  }

  // --- USERS ---
  static async getUsers(tenantId: string) {
    const query = `
      SELECT 
        id, username, role_id as "roleId", role_name as "roleName",
        status, staff_id as "staffId", last_login as "lastLogin"
      FROM system_users
      WHERE tenant_id = $1
    `;
    const res = await pool.query(query, [tenantId]);
    return res.rows;
  }

  static async upsertUser(tenantId: string, user: any) {
    const isNew = user.id.startsWith('u-');

    if (isNew) {
      const query = `
        INSERT INTO system_users (tenant_id, username, role_id, role_name, status, staff_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, role_id as "roleId", role_name as "roleName", status
      `;
      const res = await pool.query(query, [tenantId, user.username, user.roleId, user.roleName, user.status, user.staffId]);
      return res.rows[0];
    } else {
      const query = `
        UPDATE system_users
        SET username = $2, role_id = $3, role_name = $4, status = $5, staff_id = $6
        WHERE id = $7 AND tenant_id = $1
        RETURNING id, username, role_id as "roleId", role_name as "roleName", status
      `;
      const res = await pool.query(query, [tenantId, user.username, user.roleId, user.roleName, user.status, user.staffId, user.id]);
      return res.rows[0];
    }
  }
}
