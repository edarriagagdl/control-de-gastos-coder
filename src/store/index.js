import { configureStore } from '@reduxjs/toolkit';
import expenseSlice from './expenseSlice';
import categorySlice from './categorySlice';
import locationSlice from './locationSlice';

export const store = configureStore({
  reducer: {
    expenses: expenseSlice,
    categories: categorySlice,
    location: locationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
