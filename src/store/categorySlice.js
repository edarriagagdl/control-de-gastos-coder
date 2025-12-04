import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryOperations } from '../database/database';

// Acciones asíncronas
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const categories = await categoryOperations.getAll();
    return categories;
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryData) => {
    const id = await categoryOperations.create(categoryData);
    return { id, ...categoryData };
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }) => {
    await categoryOperations.update(id, categoryData);
    return { id, ...categoryData };
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id) => {
    await categoryOperations.delete(id);
    return id;
  }
);

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        // Ordenar por nombre
        state.categories.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
          // Reordenar
          state.categories.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.categories = state.categories.filter(cat => cat.id !== deletedId);
      });
  },
});

export const { clearCategories } = categorySlice.actions;
export default categorySlice.reducer;
