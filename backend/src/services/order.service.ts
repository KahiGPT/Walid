
import pool from '../db/pool';
import { v4 as uuidv4 } from 'uuid';

interface OrderItemDTO {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  modifiers: any[];
  notes?: string;
}

interface CreateOrderDTO {
  id: string; // Client generated UUID
  branch_id: string;
  device_id: string;
  type: string;
  items: OrderItemDTO[];
  subtotal: number;
  total: number;
}

export class OrderService {
  
  /**
   * Creates an order and its events atomically.
   * Uses BEGIN ... COMMIT to ensure data integrity.
   */
  static async createOrder(tenantId: string, data: CreateOrderDTO) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Insert Order Header
      const orderQuery = `
        INSERT INTO orders (
          id, tenant_id, branch_id, device_id, type, 
          status, subtotal, final_total, created_at, client_created_at
        ) VALUES ($1, $2, $3, $4, $5, 'OPEN', $6, $7, NOW(), NOW())
        RETURNING id
      `;
      
      await client.query(orderQuery, [
        data.id,
        tenantId,
        data.branch_id,
        data.device_id,
        data.type,
        data.subtotal,
        data.total
      ]);

      // 2. Insert Order Items
      const itemQuery = `
        INSERT INTO order_items (
          id, tenant_id, order_id, menu_item_id, quantity, 
          unit_price, total_price, modifiers, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
      `;

      for (const item of data.items) {
        await client.query(itemQuery, [
          uuidv4(),
          tenantId,
          data.id,
          item.menu_item_id,
          item.quantity,
          item.unit_price,
          item.unit_price * item.quantity,
          JSON.stringify(item.modifiers),
          item.notes || ''
        ]);
      }

      // 3. Insert Outbox Event (The "Truth" for other services)
      // This guarantees that if the order is saved, the event IS saved.
      const eventQuery = `
        INSERT INTO outbox_events (
          tenant_id, aggregate_type, aggregate_id, event_type, payload
        ) VALUES ($1, 'ORDER', $2, 'ORDER_CREATED', $3)
      `;

      const eventPayload = {
        orderId: data.id,
        items: data.items,
        total: data.total,
        timestamp: new Date().toISOString()
      };

      await client.query(eventQuery, [
        tenantId, 
        data.id, 
        JSON.stringify(eventPayload)
      ]);

      await client.query('COMMIT');
      return { success: true, orderId: data.id };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Order Transaction Failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
