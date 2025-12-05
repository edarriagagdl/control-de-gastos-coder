import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { operacionesCategorias } from '../database/database';

// Acciones asíncronas para categorías
export const cargarCategorias = createAsyncThunk(
  'categorias/cargar',
  async () => {
    const categorias = await operacionesCategorias.obtenerTodas();
    return categorias;
  }
);

export const agregarCategoria = createAsyncThunk(
  'categorias/agregar',
  async (nombre) => {
    await operacionesCategorias.agregar(nombre);
    return {
      id: Date.now(), // ID temporal
      name: nombre
    };
  }
);

// Slice de categorías
const categoriasSlice = createSlice({
  name: 'categorias',
  initialState: {
    lista: [],
    cargando: false,
    error: null
  },
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
    // Acciones para manejar las categorías
    categoriasRecibidas: (state, action) => {
      state.lista = action.payload;
      state.cargando = false;
    },
    categoriaAgregada: (state, action) => {
      state.lista.push(action.payload);
      state.cargando = false;
    },
    establecerCargando: (state, action) => {
      state.cargando = action.payload;
    },
    establecerError: (state, action) => {
      state.error = action.payload;
      state.cargando = false;
    }
  }
});

export const { 
  limpiarError, 
  categoriasRecibidas, 
  categoriaAgregada, 
  establecerCargando, 
  establecerError 
} = categoriasSlice.actions;
export default categoriasSlice.reducer;
