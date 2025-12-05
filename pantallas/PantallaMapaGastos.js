import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';

export default function PantallaMapaGastos() {
  const [ubicacion, setUbicacion] = useState(null);
  const [permisos, setPermisos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const gastos = useSelector(state => state.gastos.lista);

  useEffect(() => {
    solicitarPermisos();
  }, []);

  const solicitarPermisos = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para mostrar información de ubicación');
        setCargando(false);
        return;
      }

      setPermisos(true);
      obtenerUbicacion();
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener permisos de ubicación');
      setCargando(false);
    }
  };

  const obtenerUbicacion = async () => {
    try {
      setCargando(true);
      const ubicacionActual = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Obtener dirección legible
      const direccion = await Location.reverseGeocodeAsync({
        latitude: ubicacionActual.coords.latitude,
        longitude: ubicacionActual.coords.longitude,
      });

      setUbicacion({
        latitude: ubicacionActual.coords.latitude,
        longitude: ubicacionActual.coords.longitude,
        direccion: direccion[0] || null,
      });
      setCargando(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={estilos.safeArea}>
        <View style={estilos.contenedor}>
          <View style={estilos.cargando}>
            <Text style={estilos.textoCargando}>🌍 Obteniendo ubicación...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!permisos) {
    return (
      <SafeAreaView style={estilos.safeArea}>
        <View style={estilos.contenedor}>
          <View style={estilos.error}>
            <Text style={estilos.textoError}>📍 Permisos de ubicación necesarios</Text>
            <TouchableOpacity style={estilos.botonReintentar} onPress={solicitarPermisos}>
              <Text style={estilos.textoBoton}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.safeArea}>
      <ScrollView style={estilos.contenedor}>
        <Text style={estilos.titulo}>📍 Tu Ubicación y Gastos</Text>
      
      {/* Información de ubicación */}
      {ubicacion && (
        <View style={estilos.tarjetaUbicacion}>
          <Text style={estilos.subtitulo}>🌍 Tu ubicación actual</Text>
          <Text style={estilos.coordenadas}>
            📐 Lat: {ubicacion.latitude.toFixed(4)}, Lng: {ubicacion.longitude.toFixed(4)}
          </Text>
          
          {ubicacion.direccion && (
            <View style={estilos.direccion}>
              <Text style={estilos.textodireccion}>
                📍 {ubicacion.direccion.street || 'Calle no disponible'}
              </Text>
              <Text style={estilos.textodireccion}>
                🏙️ {ubicacion.direccion.city || ubicacion.direccion.district}, {ubicacion.direccion.region}
              </Text>
              <Text style={estilos.textodireccion}>
                🌎 {ubicacion.direccion.country}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Lista de gastos recientes */}
      <View style={estilos.tarjetaGastos}>
        <Text style={estilos.subtitulo}>📋 Gastos Recientes</Text>
        {gastos.slice(0, 5).map((gasto, index) => (
          <View key={index} style={estilos.itemGasto}>
            <View style={estilos.infoGasto}>
              <Text style={estilos.descripcionGasto}>
                {gasto.description || `Gasto ${index + 1}`}
              </Text>
              <Text style={estilos.categoriaGasto}>
                📂 {gasto.category || 'Sin categoría'}
              </Text>
            </View>
            <Text style={estilos.montoGasto}>
              ${(gasto.amount || 0).toFixed(2)}
            </Text>
          </View>
        ))}
        
        {gastos.length === 0 && (
          <Text style={estilos.sinGastos}>
            � No hay gastos registrados aún
          </Text>
        )}
      </View>

      <TouchableOpacity style={estilos.botonActualizar} onPress={obtenerUbicacion}>
        <Text style={estilos.textoBoton}>🔄 Actualizar Ubicación</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contenedor: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#2c3e50',
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoError: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  tarjetaUbicacion: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tarjetaGastos: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  coordenadas: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  direccion: {
    marginBottom: 15,
  },
  textodireccion: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estadistica: {
    alignItems: 'center',
  },
  numeroEstadistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  textoEstadistica: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  itemGasto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoGasto: {
    flex: 1,
  },
  descripcionGasto: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  categoriaGasto: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  montoGasto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  sinGastos: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  botonReintentar: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonActualizar: {
    backgroundColor: '#27ae60',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBoton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
