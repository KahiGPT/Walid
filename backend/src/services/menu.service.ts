
import pool from '../db/pool';

export class MenuService {
  static async getFullMenu(tenantId: string) {
    const client = await pool.connect();
    try {
      // Fetch Categories
      // Assuming table 'categories' exists from seed data
      const catResult = await client.query(
        `SELECT id, name, name_ar as "nameAr" 
         FROM categories 
         WHERE tenant_id = $1 
         ORDER BY sort_order ASC`,
        [tenantId]
      );

      // Fetch Items
      // Assuming table 'menu_items' exists from seed data
      const itemResult = await client.query(
        `SELECT id, category_id as "categoryId", name, name_ar as "nameAr", price, cost 
         FROM menu_items 
         WHERE tenant_id = $1 AND is_active = true`,
        [tenantId]
      );

      return {
        categories: catResult.rows,
        items: itemResult.rows
      };
    } finally {
      client.release();
    }
  }
}
