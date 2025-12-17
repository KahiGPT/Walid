
import pool from '../db/pool';

export class InventoryService {
  
  static async getInventory(tenantId: string) {
    // Joins inventory items with their current stock levels
    const query = `
      SELECT 
        i.id, 
        i.name, 
        i.unit, 
        i.min_level as "minLevel", 
        i.current_avg_cost as "costPerUnit",
        COALESCE(s.quantity_on_hand, 0) as "currentStock",
        i.category,
        COALESCE(sup.name, 'Unknown') as supplier,
        i.main_supplier_id as "supplierId"
      FROM inventory_items i
      LEFT JOIN stock_levels s ON i.id = s.inventory_item_id
      LEFT JOIN suppliers sup ON i.main_supplier_id = sup.id
      WHERE i.tenant_id = $1
      ORDER BY i.name ASC
    `;
    const { rows } = await pool.query(query, [tenantId]);
    return rows;
  }

  static async adjustStock(tenantId: string, userId: string, itemId: string, delta: number, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update Stock Level (Upsert-like logic, though usually seeded)
      // We assume stock_levels row exists for the item.
      const updateQuery = `
        UPDATE stock_levels 
        SET quantity_on_hand = quantity_on_hand + $1, updated_at = NOW()
        WHERE inventory_item_id = $2 AND tenant_id = $3
        RETURNING quantity_on_hand
      `;
      const res = await client.query(updateQuery, [delta, itemId, tenantId]);
      
      if (res.rowCount === 0) {
        throw new Error('Item not found or stock record missing');
      }

      // 2. Log Movement (Audit Trail)
      const logQuery = `
        INSERT INTO stock_movements (
          tenant_id, inventory_item_id, type, quantity_delta, reason, created_by, created_at
        ) VALUES ($1, $2, 'MANUAL_ADJUSTMENT', $3, $4, $5, NOW())
      `;
      await client.query(logQuery, [tenantId, itemId, delta, reason, userId]);

      await client.query('COMMIT');
      return { success: true, newStock: res.rows[0].quantity_on_hand };
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("Stock Adjust Error", e);
      throw e;
    } finally {
      client.release();
    }
  }
}
