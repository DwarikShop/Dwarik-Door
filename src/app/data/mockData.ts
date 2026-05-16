export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  stock: number;
  reserved: number;
  damaged: number;
  price: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  height: number;
  width: number;
  unit: 'inch' | 'mm';
  customization?: string;
  quantity: number;
  status: 'placed' | 'in_progress' | 'done' | 'shipped' | 'cancelled' | 'rejected';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  customerPhone?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: 'owner' | 'employee';
  password: string;
}

export const products: Product[] = [
  {
    id: 'DW-001',
    name: 'Premium Teak Veneer Door',
    category: 'Flush Doors',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=600&fit=crop',
    stock: 45,
    reserved: 12,
    damaged: 2,
    price: 12500
  },
  {
    id: 'DW-002',
    name: 'Walnut Laminated Door',
    category: 'Laminated Doors',
    image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400&h=600&fit=crop',
    stock: 32,
    reserved: 8,
    damaged: 1,
    price: 9800
  },
  {
    id: 'DW-003',
    name: 'Oak Designer Door',
    category: 'Designer Doors',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop',
    stock: 18,
    reserved: 5,
    damaged: 0,
    price: 18500
  },
  {
    id: 'DW-004',
    name: 'Cherry Wood Panel Door',
    category: 'Panel Doors',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=600&fit=crop',
    stock: 28,
    reserved: 6,
    damaged: 1,
    price: 14200
  },
  {
    id: 'DW-005',
    name: 'Mahogany Carved Door',
    category: 'Carved Doors',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
    stock: 12,
    reserved: 3,
    damaged: 0,
    price: 22000
  },
  {
    id: 'DW-006',
    name: 'Modern Glass Panel Door',
    category: 'Glass Doors',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=600&fit=crop',
    stock: 25,
    reserved: 7,
    damaged: 2,
    price: 16500
  },
  {
    id: 'DW-007',
    name: 'Rustic Barn Door',
    category: 'Sliding Doors',
    image: 'https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=400&h=600&fit=crop',
    stock: 8,
    reserved: 2,
    damaged: 0,
    price: 19800
  },
  {
    id: 'DW-008',
    name: 'Classic White Door',
    category: 'Flush Doors',
    image: 'https://images.unsplash.com/photo-1614607242094-b1b2cf769a12?w=400&h=600&fit=crop',
    stock: 52,
    reserved: 15,
    damaged: 3,
    price: 8500
  }
];

export const employees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    role: 'owner',
    password: 'admin123'
  },
  {
    id: 'EMP-002',
    name: 'Suresh Patel',
    phone: '9876543211',
    role: 'employee',
    password: 'emp123'
  },
  {
    id: 'EMP-003',
    name: 'Amit Sharma',
    phone: '9876543212',
    role: 'employee',
    password: 'emp123'
  },
  {
    id: 'EMP-004',
    name: 'Vikram Singh',
    phone: '9876543213',
    role: 'employee',
    password: 'emp123'
  }
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    productId: 'DW-001',
    productName: 'Premium Teak Veneer Door',
    productImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=600&fit=crop',
    height: 84,
    width: 36,
    unit: 'inch',
    customization: 'Add decorative groove pattern',
    quantity: 2,
    status: 'placed',
    assignedTo: 'EMP-002',
    createdAt: new Date('2026-05-14'),
    updatedAt: new Date('2026-05-14'),
    customerName: 'Anand Builders',
    customerPhone: '9123456789'
  },
  {
    id: 'ORD-002',
    productId: 'DW-003',
    productName: 'Oak Designer Door',
    productImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=600&fit=crop',
    height: 2134,
    width: 914,
    unit: 'mm',
    quantity: 1,
    status: 'in_progress',
    assignedTo: 'EMP-003',
    createdAt: new Date('2026-05-13'),
    updatedAt: new Date('2026-05-15'),
    customerName: 'Sharma Residence',
    customerPhone: '9234567890'
  },
  {
    id: 'ORD-003',
    productId: 'DW-005',
    productName: 'Mahogany Carved Door',
    productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
    height: 96,
    width: 42,
    unit: 'inch',
    customization: 'Custom floral carving with gold inlay',
    quantity: 1,
    status: 'done',
    assignedTo: 'EMP-002',
    createdAt: new Date('2026-05-10'),
    updatedAt: new Date('2026-05-15'),
    customerName: 'Royal Interiors',
    customerPhone: '9345678901'
  },
  {
    id: 'ORD-004',
    productId: 'DW-002',
    productName: 'Walnut Laminated Door',
    productImage: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400&h=600&fit=crop',
    height: 80,
    width: 32,
    unit: 'inch',
    quantity: 3,
    status: 'shipped',
    assignedTo: 'EMP-004',
    createdAt: new Date('2026-05-08'),
    updatedAt: new Date('2026-05-14'),
    customerName: 'Metro Projects',
    customerPhone: '9456789012'
  }
];
