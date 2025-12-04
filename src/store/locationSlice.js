import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

// Acciones asíncronas
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async () => {
    try {
      // Solicitar permisos
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permisos de ubicación denegados');
      }

      // Obtener ubicación actual
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Obtener dirección legible
      let addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let address = 'Ubicación desconocida';
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        address = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`.trim();
        if (address === ',') address = 'Ubicación desconocida';
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Error obteniendo ubicación: ${error.message}`);
    }
  }
);

export const reverseGeocode = createAsyncThunk(
  'location/reverseGeocode',
  async ({ latitude, longitude }) => {
    try {
      let addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = 'Ubicación desconocida';
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        address = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}`.trim();
        if (address === ',') address = 'Ubicación desconocida';
      }

      return {
        latitude,
        longitude,
        address,
      };
    } catch (error) {
      throw new Error(`Error obteniendo dirección: ${error.message}`);
    }
  }
);

// Slice
const locationSlice = createSlice({
  name: 'location',
  initialState: {
    currentLocation: null,
    address: null,
    loading: false,
    error: null,
    permissionStatus: null,
    lastUpdated: null,
  },
  reducers: {
    clearLocation: (state) => {
      state.currentLocation = null;
      state.address = null;
      state.lastUpdated = null;
    },
    setPermissionStatus: (state, action) => {
      state.permissionStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current location
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        };
        state.address = action.payload.address;
        state.lastUpdated = action.payload.timestamp;
        state.permissionStatus = 'granted';
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        if (action.error.message.includes('denegados')) {
          state.permissionStatus = 'denied';
        }
      })
      
      // Reverse geocode
      .addCase(reverseGeocode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reverseGeocode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        };
        state.address = action.payload.address;
      })
      .addCase(reverseGeocode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearLocation, setPermissionStatus, clearError } = locationSlice.actions;
export default locationSlice.reducer;
