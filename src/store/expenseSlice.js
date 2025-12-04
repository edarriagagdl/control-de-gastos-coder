import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseOperations } from '../database/database';

// Acciones asíncronas
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    const expenses = await expenseOperations.getAll();
    return expenses;
  }
);

export const fetchCurrentMonthExpenses = createAsyncThunk(
  'expenses/fetchCurrentMonth',
  async () => {
    const expenses = await expenseOperations.getCurrentMonth();
    return expenses;
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expenseData) => {
    const id = await expenseOperations.create(expenseData);
    return { id, ...expenseData };
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }) => {
    await expenseOperations.update(id, expenseData);
    return { id, ...expenseData };
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id) => {
    await expenseOperations.delete(id);
    return id;
  }
);

// Slice
const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    currentMonthExpenses: [],
    loading: false,
    error: null,
    totalSpent: 0,
  },
  reducers: {
    clearExpenses: (state) => {
      state.expenses = [];
      state.currentMonthExpenses = [];
      state.totalSpent = 0;
    },
    setTotalSpent: (state, action) => {
      state.totalSpent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch current month expenses
      .addCase(fetchCurrentMonthExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentMonthExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMonthExpenses = action.payload;
        // Calcular total gastado
        state.totalSpent = action.payload.reduce((sum, expense) => sum + expense.amount, 0);
      })
      .addCase(fetchCurrentMonthExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add expense
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        // Si es del mes actual, agregarlo también
        const expenseDate = new Date(action.payload.date);
        const now = new Date();
        if (expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()) {
          state.currentMonthExpenses.unshift(action.payload);
          state.totalSpent += action.payload.amount;
        }
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        
        const currentIndex = state.currentMonthExpenses.findIndex(exp => exp.id === action.payload.id);
        if (currentIndex !== -1) {
          const oldAmount = state.currentMonthExpenses[currentIndex].amount;
          state.currentMonthExpenses[currentIndex] = action.payload;
          state.totalSpent = state.totalSpent - oldAmount + action.payload.amount;
        }
      })
      
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const deletedId = action.payload;
        
        // Encontrar el gasto para actualizar el total antes de eliminarlo
        const expenseToDelete = state.currentMonthExpenses.find(exp => exp.id === deletedId);
        if (expenseToDelete) {
          state.totalSpent -= expenseToDelete.amount;
        }
        
        state.expenses = state.expenses.filter(exp => exp.id !== deletedId);
        state.currentMonthExpenses = state.currentMonthExpenses.filter(exp => exp.id !== deletedId);
      });
  },
});

export const { clearExpenses, setTotalSpent } = expenseSlice.actions;
export default expenseSlice.reducer;
