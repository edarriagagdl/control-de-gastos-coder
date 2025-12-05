import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { inicializarBaseDatos, operacionesGastos, operacionesCategorias } from './database/database';

// Importar componentes
import Navegacion from './components/Navegacion';
import ModalAgregarGasto from './components/ModalAgregarGasto';
import ModalAgregarCategoria from './components/ModalAgregarCategoria';

// Importar pantallas
import PantallaResumen from './pantallas/PantallaResumen';
import PantallaGastos from './pantallas/PantallaGastos';
import PantallaCategorias from './pantallas/PantallaCategorias';

export default function App() {
  const [pantallActual, setPantallaActual] = useState('gastos');
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    cantidad: '',
    descripcion: '',
    categoria: 'Comida'
  });
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    inicializarApp();
  }, []);

  const inicializarApp = async () => {
    try {
      await inicializarBaseDatos();
      await cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo inicializar la aplicación');
    }
  };

  const cargarDatos = async () => {
    try {
      const datosGastos = await operacionesGastos.obtenerTodos();
      const datosCategorias = await operacionesCategorias.obtenerTodas();
      
      setGastos(datosGastos);
      setCategorias(datosCategorias);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const agregarGasto = async () => {
    if (!nuevoGasto.cantidad || !nuevoGasto.descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const hoy = new Date().toISOString().split('T')[0];
      await operacionesGastos.agregar(
        parseFloat(nuevoGasto.cantidad), 
        nuevoGasto.descripcion, 
        nuevoGasto.categoria, 
        hoy
      );
      
      setNuevoGasto({ cantidad: '', descripcion: '', categoria: 'Comida' });
      setMostrarModalAgregar(false);
      await cargarDatos();
      Alert.alert('Éxito', 'Gasto agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el gasto');
    }
  };

  const eliminarGasto = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este gasto?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await operacionesGastos.eliminar(id);
              await cargarDatos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          }
        }
      ]
    );
  };

  const agregarCategoria = async () => {
    if (!nuevaCategoria) {
      Alert.alert('Error', 'Escribe el nombre de la categoría');
      return;
    }

    try {
      await operacionesCategorias.agregar(nuevaCategoria);
      setNuevaCategoria('');
      setMostrarModalCategoria(false);
      await cargarDatos();
      Alert.alert('Éxito', 'Categoría agregada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la categoría');
    }
  };

  const obtenerTotalGastos = () => {
    return gastos.reduce((total, gasto) => total + gasto.amount, 0).toFixed(2);
  };

  const renderizarPantallaActual = () => {
    switch (pantallActual) {
      case 'dashboard':
        return (
          <PantallaResumen 
            gastos={gastos}
            totalGastos={obtenerTotalGastos()}
          />
        );
      case 'gastos':
        return (
          <PantallaGastos
            gastos={gastos}
            totalGastos={obtenerTotalGastos()}
            onAgregarGasto={() => setMostrarModalAgregar(true)}
            onEliminarGasto={eliminarGasto}
          />
        );
      case 'categorias':
        return (
          <PantallaCategorias
            categorias={categorias}
            onAgregarCategoria={() => setMostrarModalCategoria(true)}
          />
        );
      default:
        return (
          <PantallaGastos
            gastos={gastos}
            totalGastos={obtenerTotalGastos()}
            onAgregarGasto={() => setMostrarModalAgregar(true)}
            onEliminarGasto={eliminarGasto}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Control de Gastos</Text>
      </View>

      <Navegacion 
        pantallaActual={pantallActual}
        onCambiarPantalla={setPantallaActual}
      />

      {renderizarPantallaActual()}
      
      <ModalAgregarGasto
        visible={mostrarModalAgregar}
        nuevoGasto={nuevoGasto}
        categorias={categorias}
        onCambiarGasto={setNuevoGasto}
        onGuardar={agregarGasto}
        onCerrar={() => setMostrarModalAgregar(false)}
      />

      <ModalAgregarCategoria
        visible={mostrarModalCategoria}
        nuevaCategoria={nuevaCategoria}
        onCambiarCategoria={setNuevaCategoria}
        onGuardar={agregarCategoria}
        onCerrar={() => setMostrarModalCategoria(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
