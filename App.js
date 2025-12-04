import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { initDatabase } from './src/database/database';
import MainApp from './src/components/MainApp';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar base de datos
      await initDatabase();
      console.log('✅ Base de datos inicializada');
      
      setDbInitialized(true);
      
      // Pequeña pausa para mostrar el splash
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
      Alert.alert(
        'Error de Inicialización', 
        'Hubo un problema al inicializar la aplicación. Por favor, reinicia la app.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.appTitle}>💰 ExpenseTracker</Text>
        <Text style={styles.subtitle}>Control de Gastos Inteligente</Text>
        <ActivityIndicator 
          size="large" 
          color="#FFFFFF" 
          style={styles.loader} 
        />
        <Text style={styles.loadingText}>
          {dbInitialized ? 'Configurando...' : 'Inicializando base de datos...'}
        </Text>
        <View style={styles.features}>
          <Text style={styles.feature}>📊 Seguimiento en tiempo real</Text>
          <Text style={styles.feature}>📍 Ubicación de gastos</Text>
          <Text style={styles.feature}>💾 Datos seguros localmente</Text>
          <Text style={styles.feature}>📈 Reportes detallados</Text>
        </View>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <MainApp />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F4FD',
    marginBottom: 50,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#E8F4FD',
    marginBottom: 40,
    textAlign: 'center',
  },
  features: {
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: 14,
    color: '#E8F4FD',
    marginVertical: 4,
    textAlign: 'left',
  },
});
