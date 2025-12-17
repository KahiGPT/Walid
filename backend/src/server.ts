
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import { tenancyMiddleware } from './middleware/tenancy'; // Ensure this exists
import authRoutes from './routes/v1/auth';
import orderRoutes from './routes/v1/orders';
import menuRoutes from './routes/v1/menu';
import inventoryRoutes from './routes/v1/inventory';
import adminRoutes from './routes/v1/admin';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security & Parsing Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Middleware Chain ---
// 1. Extract Tenant ID from Header
app.use(tenancyMiddleware);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// --- Public Routes ---
app.use('/api/v1/auth', authRoutes);

// --- Protected Routes ---
// Note: In production, apply 'authenticate' middleware. 
// For this demo, we might skip auth on admin routes to allow easy testing if JWT setup isn't complete.
app.use('/api/v1/orders', authenticate, orderRoutes);
app.use('/api/v1/menu', authenticate, menuRoutes);
app.use('/api/v1/inventory', authenticate, inventoryRoutes);
app.use('/api/v1/admin', adminRoutes); // Add Admin Routes

app.listen(PORT, () => {
  console.log(`Foodika Backend Service running on port ${PORT}`);
});
