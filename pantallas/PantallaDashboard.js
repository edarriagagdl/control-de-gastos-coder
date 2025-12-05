import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const PantallaDashboard = ({ gastos, totalGastos }) => {
  const ultimosGastos = gastos.slice(0, 5);

  return (
    <ScrollView style={styles.pantalla}>
      <Text style={styles.titulo}>Mi Resumen</Text>
      
      <View style={styles.tarjetaResumen}>
        <Text style={styles.tituloResumen}>Resumen</Text>
        <Text style={styles.cantidadResumen}>Total gastado: ${totalGastos}</Text>
        <Text style={styles.textoResumen}>Número de gastos: {gastos.length}</Text>
      </View>

      <View style={styles.tarjetaRecientes}>
        <Text style={styles.tituloTarjeta}>Últimos Gastos</Text>
        {ultimosGastos.map(gasto => (
          <View key={gasto.id} style={styles.elementoReciente}>
            <Text>{gasto.description}</Text>
            <Text>${gasto.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  tarjetaResumen: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  tituloResumen: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cantidadResumen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  textoResumen: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  tarjetaRecientes: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  tituloTarjeta: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  elementoReciente: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
});

export default PantallaDashboard;
