import * as SQLite from 'expo-sqlite';

// Instancia de base de datos
let db;

// Inicializar base de datos
export const inicializarBaseDatos = async () => {
  db = await SQLite.openDatabaseAsync('gastos.db');
  
  // Crear tabla de gastos
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT,
      category TEXT,
      date TEXT
    );
  `);
  
  // Crear tabla de categorías  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);
  
  // Insertar categorías por defecto si no existen
  const categorias = await db.getAllAsync('SELECT * FROM categories');
  if (categorias.length === 0) {
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', ['Comida']);
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', ['Transporte']);
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', ['Entretenimiento']);
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', ['Otros']);
  }
};

// Operaciones de gastos
export const operacionesGastos = {
  // Obtener todos los gastos
  obtenerTodos: async () => {
    return await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC');
  },

  // Agregar nuevo gasto
  agregar: async (cantidad, descripcion, categoria, fecha) => {
    return await db.runAsync(
      'INSERT INTO expenses (amount, description, category, date) VALUES (?, ?, ?, ?)',
      [cantidad, descripcion, categoria, fecha]
    );
  },

  // Eliminar gasto
  eliminar: async (id) => {
    return await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  }
};

// Operaciones de categorías
export const operacionesCategorias = {
  // Obtener todas las categorías
  obtenerTodas: async () => {
    return await db.getAllAsync('SELECT * FROM categories');
  },

  // Agregar nueva categoría
  agregar: async (nombre) => {
    return await db.runAsync('INSERT INTO categories (name) VALUES (?)', [nombre]);
  },

  // Limpiar categorías duplicadas
  limpiarDuplicados: async () => {
    // Eliminar duplicados manteniendo solo el primer registro de cada nombre
    await db.runAsync(`
      DELETE FROM categories 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM categories 
        GROUP BY name
      )
    `);
  }
};
