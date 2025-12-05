import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { operacionesGastos } from '../database/database';

// Acciones asíncronas simples
export const cargarGastos = createAsyncThunk(
  'gastos/cargar',
  async () => {
    const gastos = await operacionesGastos.obtenerTodos();
    return gastos;
  }
);

export const agregarGasto = createAsyncThunk(
  'gastos/agregar',
  async (nuevoGasto) => {
    const hoy = new Date().toISOString().split('T')[0];
    await operacionesGastos.agregar(
      parseFloat(nuevoGasto.cantidad),
      nuevoGasto.descripcion,
      nuevoGasto.categoria,
      hoy
    );
    // Retornamos los datos para actualizar el estado
    return {
      amount: parseFloat(nuevoGasto.cantidad),
      description: nuevoGasto.descripcion,
      category: nuevoGasto.categoria,
      date: hoy,
      id: Date.now() // ID temporal
    };
  }
);

export const eliminarGasto = createAsyncThunk(
  'gastos/eliminar',
  async (id) => {
    await operacionesGastos.eliminar(id);
    return id;
  }
);

// Slice de gastos
const gastosSlice = createSlice({
  name: 'gastos',
  initialState: {
    lista: [],
    cargando: false,
    error: null
  },
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
    // Acciones para manejar los gastos
    gastosRecibidos: (state, action) => {
      state.lista = action.payload;
      state.cargando = false;
    },
    gastoAgregado: (state, action) => {
      state.lista.unshift(action.payload); // Agregar al inicio
      state.cargando = false;
    },
    gastoEliminado: (state, action) => {
      state.lista = state.lista.filter(gasto => gasto.id !== action.payload);
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
  gastosRecibidos, 
  gastoAgregado, 
  gastoEliminado, 
  establecerCargando, 
  establecerError 
} = gastosSlice.actions;
export default gastosSlice.reducer;
