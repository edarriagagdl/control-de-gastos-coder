import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const Navegacion = ({ pantallaActual, onCambiarPantalla }) => {
  const botones = [
    { id: 'dashboard', texto: 'Inicio' },
    { id: 'gastos', texto: 'Gastos' },
    { id: 'categorias', texto: 'Categorías' }
  ];

  return (
    <View style={styles.navegacion}>
      {botones.map(boton => (
        <TouchableOpacity 
          key={boton.id}
          style={[
            styles.botonNav, 
            pantallaActual === boton.id && styles.botonNavActivo
          ]}
          onPress={() => onCambiarPantalla(boton.id)}
        >
          <Text style={styles.textoBotonNav}>{boton.texto}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navegacion: {
    flexDirection: 'row',
    backgroundColor: '#2980b9',
    padding: 10,
  },
  botonNav: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  botonNavActivo: {
    backgroundColor: '#1abc9c',
  },
  textoBotonNav: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Navegacion;
