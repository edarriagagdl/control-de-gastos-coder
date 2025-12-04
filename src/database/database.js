import * as SQLite from 'expo-sqlite';

// Nombre de la base de datos
const DATABASE_NAME = 'expense_tracker.db';

let db = null;

// Inicializar la base de datos
export const initDatabase = async () => {
  try {
    console.log('Inicializando base de datos...');
    
    // Abrir conexión
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    // Crear tablas
    await createTables();
    
    console.log('Base de datos inicializada correctamente');
    return db;
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }
};

// Crear todas las tablas necesarias
const createTables = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Tabla de categorías
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT DEFAULT '💰',
        color TEXT DEFAULT '#4A90E2',
        monthly_budget REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de gastos
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );

      -- Tabla de presupuestos mensuales
      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        planned_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        UNIQUE(year, month, category_id)
      );

      -- Índices para mejorar rendimiento
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
      CREATE INDEX IF NOT EXISTS idx_monthly_budgets_period ON monthly_budgets(year, month);
    `);

    // Insertar categorías por defecto si no existen
    await insertDefaultCategories();
    
    console.log('Tablas creadas correctamente');
  } catch (error) {
    console.error('Error creando tablas:', error);
    throw error;
  }
};

// Insertar categorías por defecto
const insertDefaultCategories = async () => {
  try {
    const defaultCategories = [
      { name: 'Alimentación', icon: '🍕', color: '#FF6B6B', budget: 4000 },
      { name: 'Transporte', icon: '🚗', color: '#4ECDC4', budget: 2000 },
      { name: 'Entretenimiento', icon: '🎬', color: '#45B7D1', budget: 1500 },
      { name: 'Salud', icon: '🏥', color: '#96CEB4', budget: 1200 },
      { name: 'Educación', icon: '📚', color: '#FFEAA7', budget: 1800 },
      { name: 'Servicios', icon: '🏠', color: '#DDA0DD', budget: 3500 },
      { name: 'Ropa', icon: '👕', color: '#98D8C8', budget: 1000 },
      { name: 'Otros', icon: '💼', color: '#95A5A6', budget: 800 }
    ];

    for (const category of defaultCategories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (name, icon, color, monthly_budget) VALUES (?, ?, ?, ?)`,
        [category.name, category.icon, category.color, category.budget]
      );
    }
  } catch (error) {
    console.error('Error insertando categorías por defecto:', error);
  }
};

// ============ OPERACIONES DE CATEGORÍAS ============

export const categoryOperations = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC');
      return result;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  },

  // Crear nueva categoría
  create: async (category) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO categories (name, icon, color, monthly_budget) VALUES (?, ?, ?, ?)',
        [category.name, category.icon, category.color, category.monthly_budget || 0]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  },

  // Actualizar categoría
  update: async (id, category) => {
    try {
      await db.runAsync(
        'UPDATE categories SET name = ?, icon = ?, color = ?, monthly_budget = ? WHERE id = ?',
        [category.name, category.icon, category.color, category.monthly_budget, id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      throw error;
    }
  },

  // Eliminar categoría
  delete: async (id) => {
    try {
      await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      throw error;
    }
  }
};

// ============ OPERACIONES DE GASTOS ============

export const expenseOperations = {
  // Obtener todos los gastos con información de categoría
  getAll: async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT 
          e.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        ORDER BY e.date DESC
      `);
      return result;
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      throw error;
    }
  },

  // Obtener gastos del mes actual
  getCurrentMonth: async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await db.getAllAsync(`
        SELECT 
          e.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE strftime('%Y', e.date) = ? AND strftime('%m', e.date) = ?
        ORDER BY e.date DESC
      `, [year.toString(), month.toString().padStart(2, '0')]);
      
      return result;
    } catch (error) {
      console.error('Error obteniendo gastos del mes:', error);
      throw error;
    }
  },

  // Crear nuevo gasto
  create: async (expense) => {
    try {
      const result = await db.runAsync(
        `INSERT INTO expenses (category_id, amount, description, location_name, latitude, longitude, date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          expense.category_id,
          expense.amount,
          expense.description,
          expense.location_name || null,
          expense.latitude || null,
          expense.longitude || null,
          expense.date || new Date().toISOString()
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando gasto:', error);
      throw error;
    }
  },

  // Actualizar gasto
  update: async (id, expense) => {
    try {
      await db.runAsync(
        `UPDATE expenses SET category_id = ?, amount = ?, description = ?, 
         location_name = ?, latitude = ?, longitude = ?, date = ? WHERE id = ?`,
        [
          expense.category_id,
          expense.amount,
          expense.description,
          expense.location_name || null,
          expense.latitude || null,
          expense.longitude || null,
          expense.date,
          id
        ]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      throw error;
    }
  },

  // Eliminar gasto
  delete: async (id) => {
    try {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  },

  // Obtener gastos por categoría en un rango de fechas
  getByCategory: async (categoryId, startDate, endDate) => {
    try {
      const result = await db.getAllAsync(
        `SELECT * FROM expenses WHERE category_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC`,
        [categoryId, startDate, endDate]
      );
      return result;
    } catch (error) {
      console.error('Error obteniendo gastos por categoría:', error);
      throw error;
    }
  }
};

// ============ OPERACIONES DE PRESUPUESTOS ============

export const budgetOperations = {
  // Obtener presupuesto mensual
  getMonthlyBudget: async (year, month) => {
    try {
      const result = await db.getAllAsync(`
        SELECT 
          mb.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color
        FROM monthly_budgets mb
        LEFT JOIN categories c ON mb.category_id = c.id
        WHERE mb.year = ? AND mb.month = ?
        ORDER BY c.name ASC
      `, [year, month]);
      
      return result;
    } catch (error) {
      console.error('Error obteniendo presupuesto mensual:', error);
      throw error;
    }
  },

  // Crear o actualizar presupuesto mensual
  setMonthlyBudget: async (year, month, categoryId, amount) => {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO monthly_budgets (year, month, category_id, planned_amount) 
         VALUES (?, ?, ?, ?)`,
        [year, month, categoryId, amount]
      );
      return true;
    } catch (error) {
      console.error('Error estableciendo presupuesto mensual:', error);
      throw error;
    }
  }
};

// ============ UTILIDADES Y ESTADÍSTICAS ============

export const statsOperations = {
  // Obtener resumen del mes actual
  getCurrentMonthSummary: async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await db.getAllAsync(`
        SELECT 
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          c.monthly_budget,
          COALESCE(SUM(e.amount), 0) as spent,
          COUNT(e.id) as transaction_count
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id 
          AND strftime('%Y', e.date) = ? 
          AND strftime('%m', e.date) = ?
        GROUP BY c.id, c.name, c.icon, c.color, c.monthly_budget
        ORDER BY c.name ASC
      `, [year.toString(), month.toString().padStart(2, '0')]);
      
      return result;
    } catch (error) {
      console.error('Error obteniendo resumen del mes:', error);
      throw error;
    }
  },

  // Obtener total gastado en el mes
  getTotalSpentThisMonth: async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
      `, [year.toString(), month.toString().padStart(2, '0')]);
      
      return result.total;
    } catch (error) {
      console.error('Error obteniendo total gastado:', error);
      throw error;
    }
  },

  // Obtener gastos por día en el mes actual
  getDailySpending: async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await db.getAllAsync(`
        SELECT 
          date(date) as day,
          SUM(amount) as total
        FROM expenses
        WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
        GROUP BY date(date)
        ORDER BY date(date) ASC
      `, [year.toString(), month.toString().padStart(2, '0')]);
      
      return result;
    } catch (error) {
      console.error('Error obteniendo gastos diarios:', error);
      throw error;
    }
  }
};

// ============ UTILIDADES GENERALES ============

export const databaseUtils = {
  // Limpiar todos los datos (para testing)
  clearAllData: async () => {
    try {
      await db.execAsync(`
        DELETE FROM expenses;
        DELETE FROM monthly_budgets;
        DELETE FROM categories;
      `);
      // Reinsertar categorías por defecto
      await insertDefaultCategories();
      console.log('Todos los datos han sido limpiados');
      return true;
    } catch (error) {
      console.error('Error limpiando datos:', error);
      throw error;
    }
  },

  // Exportar datos (para backup)
  exportData: async () => {
    try {
      const [categories, expenses, budgets] = await Promise.all([
        categoryOperations.getAll(),
        expenseOperations.getAll(),
        budgetOperations.getMonthlyBudget(new Date().getFullYear(), new Date().getMonth() + 1)
      ]);
      
      return {
        categories,
        expenses,
        budgets,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exportando datos:', error);
      throw error;
    }
  }
};
