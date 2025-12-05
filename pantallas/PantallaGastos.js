import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import ElementoGasto from '../components/ElementoGasto';

const PantallaGastos = ({ gastos, totalGastos, onAgregarGasto, onEliminarGasto }) => {
  return (
    <View style={styles.pantalla}>
      <Text style={styles.titulo}>Mis Gastos</Text>
      <Text style={styles.totalCantidad}>Total gastado: ${totalGastos}</Text>

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
    padding: 20,
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
});

export default PantallaGastos;
