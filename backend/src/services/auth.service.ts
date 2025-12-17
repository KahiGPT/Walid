
import pool from '../db/pool';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// Validation Schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type LoginDTO = z.infer<typeof LoginSchema>;

export class AuthService {
  
  static async login(credentials: LoginDTO) {
    // 1. Validate Input
    const { email, password } = LoginSchema.parse(credentials);

    const client = await pool.connect();
    try {
      // 2. Find User
      const query = `
        SELECT id, tenant_id, email, password_hash, role 
        FROM users 
        WHERE email = $1
      `;
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];

      // 3. Verify Password
      // Note: In a real prod seed, ensure password_hash is actually a bcrypt hash. 
      // For this prototype, if the hash doesn't look like a bcrypt string, we might do a direct compare (ONLY FOR DEV SEEDS)
      const isMatch = await bcrypt.compare(password, user.password_hash);
      
      // Fallback for plain-text seed data if bcrypt fails (Development convenience only)
      const isDevFallback = !isMatch && user.password_hash === password && process.env.NODE_ENV !== 'production';

      if (!isMatch && !isDevFallback) {
        throw new Error('Invalid credentials');
      }

      // 4. Generate Token
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenant_id, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '12h' } // Shift length
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id
        }
      };

    } finally {
      client.release();
    }
  }
}
