import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import ElementoGasto from '../components/ElementoGasto';

const PantallaGastos = ({ gastos, totalGastos, onAgregarGasto, onEliminarGasto }) => {
  return (
    <View style={styles.pantalla}>

      {/* Resumen de gastos */}
      <View style={styles.tarjetaResumen}>
         <Text style={styles.subtitulo}>💰 Resumen de Gastos</Text>
         <View style={styles.estadisticas}>
           <View style={styles.estadistica}>
             <Text style={styles.numeroEstadistica}>{gastos.length}</Text>
             <Text style={styles.textoEstadistica}>Total de gastos</Text>
           </View>
           <View style={styles.estadistica}>
             <Text style={styles.numeroEstadistica}>
               ${gastos.reduce((total, gasto) => total + (gasto.amount || 0), 0).toFixed(2)}
             </Text>
             <Text style={styles.textoEstadistica}>Total gastado</Text>
           </View>
         </View>
      </View>

      <TouchableOpacity 
        style={styles.botonAgregar}
        onPress={onAgregarGasto}
      >
        <Text style={styles.textoBotonAgregar}>Agregar Gasto</Text>
      </TouchableOpacity>

      <FlatList
        data={gastos}
        renderItem={({ item }) => (
          <ElementoGasto 
            gasto={item} 
            onEliminar={onEliminarGasto} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        style={styles.listaGastos}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: 15, // Reducido de 20 para mejor ajuste
    paddingBottom: 20, // Espacio extra en la parte inferior
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  totalCantidad: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  botonAgregar: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotonAgregar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listaGastos: {
    flex: 1,
  },
  tarjetaResumen: {
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

});

export default PantallaGastos;
