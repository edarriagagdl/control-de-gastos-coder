import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const PantallaCategorias = ({ categorias, onAgregarCategoria }) => {
  return (
    <View style={styles.pantalla}>
      <Text style={styles.titulo}>Categorías</Text>
      
      <TouchableOpacity 
        style={styles.botonAgregar}
        onPress={onAgregarCategoria}
      >
        <Text style={styles.textoBotonAgregar}>Agregar Categoría</Text>
      </TouchableOpacity>

      <FlatList
        data={categorias}
        renderItem={({ item }) => (
          <View style={styles.elementoCategoria}>
            <Text style={styles.nombreCategoria}>{item.name}</Text>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
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
  elementoCategoria: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  nombreCategoria: {
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default PantallaCategorias;
