import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ElementoGasto = ({ gasto, onEliminar }) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.descripcion}>{gasto.description}</Text>
        <Text style={styles.categoria}>{gasto.category}</Text>
        <Text style={styles.fecha}>{gasto.date}</Text>
      </View>
      <View style={styles.derecha}>
        <Text style={styles.cantidad}>${gasto.amount}</Text>
        <TouchableOpacity 
          style={styles.botonEliminar}
          onPress={() => onEliminar(gasto.id)}
        >
          <Text style={styles.textoBotonEliminar}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  descripcion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  categoria: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  fecha: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  derecha: {
    alignItems: 'flex-end',
  },
  cantidad: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  botonEliminar: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  textoBotonEliminar: {
    color: 'white',
    fontSize: 12,
  },
});

export default ElementoGasto;
