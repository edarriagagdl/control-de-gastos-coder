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
    }
  }
});

export const { limpiarError } = categoriasSlice.actions;
export default categoriasSlice.reducer;
