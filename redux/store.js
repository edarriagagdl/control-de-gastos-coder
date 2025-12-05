import { configureStore } from '@reduxjs/toolkit';
import gastosReducer from './gastosSlice';
import categoriasReducer from './categoriasSlice';

// Configuración del store de Redux
export const store = configureStore({
  reducer: {
    gastos: gastosReducer,
    categorias: categoriasReducer,
  },
});
