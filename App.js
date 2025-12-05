import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { inicializarBaseDatos } from './database/database';

// Redux
import { store } from './redux/store';
import { cargarGastos, agregarGasto, eliminarGasto } from './redux/gastosSlice';
import { cargarCategorias, agregarCategoria } from './redux/categoriasSlice';

// Importar componentes
import Navegacion from './components/Navegacion';
import ModalAgregarGasto from './components/ModalAgregarGasto';
import ModalAgregarCategoria from './components/ModalAgregarCategoria';

// Importar pantallas
import PantallaResumen from './pantallas/PantallaResumen';
import PantallaGastos from './pantallas/PantallaGastos';
import PantallaCategorias from './pantallas/PantallaCategorias';

// Componente principal con Redux
function AppConRedux() {
  const dispatch = useDispatch();
  
  // Estados de Redux
  const gastosState = useSelector(state => state.gastos);
  const categoriasState = useSelector(state => state.categorias);
  
  // Estados locales para UI
  const [pantallActual, setPantallaActual] = useState('gastos');
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
      // Cargar datos usando Redux
      dispatch(cargarGastos());
      dispatch(cargarCategorias());
    } catch (error) {
      Alert.alert('Error', 'No se pudo inicializar la aplicación');
    }
  };

  const manejarAgregarGasto = async () => {
    if (!nuevoGasto.cantidad || !nuevoGasto.descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await dispatch(agregarGasto(nuevoGasto)).unwrap();
      setNuevoGasto({ cantidad: '', descripcion: '', categoria: 'Comida' });
      setMostrarModalAgregar(false);
      // Recargar la lista para obtener los IDs correctos de la BD
      dispatch(cargarGastos());
      Alert.alert('Éxito', 'Gasto agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el gasto');
    }
  };

  const manejarEliminarGasto = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este gasto?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await dispatch(eliminarGasto(id)).unwrap();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          }
        }
      ]
    );
  };

  const manejarAgregarCategoria = async () => {
    if (!nuevaCategoria) {
      Alert.alert('Error', 'Escribe el nombre de la categoría');
      return;
    }

    try {
      await dispatch(agregarCategoria(nuevaCategoria)).unwrap();
      setNuevaCategoria('');
      setMostrarModalCategoria(false);
      // Recargar para obtener IDs correctos
      dispatch(cargarCategorias());
      Alert.alert('Éxito', 'Categoría agregada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la categoría');
    }
  };

  const obtenerTotalGastos = () => {
    return gastosState.lista.reduce((total, gasto) => total + gasto.amount, 0).toFixed(2);
  };

  const renderizarPantallaActual = () => {
    switch (pantallActual) {
      case 'dashboard':
        return (
          <PantallaResumen 
            gastos={gastosState.lista}
            totalGastos={obtenerTotalGastos()}
          />
        );
      case 'gastos':
        return (
          <PantallaGastos
            gastos={gastosState.lista}
            totalGastos={obtenerTotalGastos()}
            onAgregarGasto={() => setMostrarModalAgregar(true)}
            onEliminarGasto={manejarEliminarGasto}
          />
        );
      case 'categorias':
        return (
          <PantallaCategorias
            categorias={categoriasState.lista}
            onAgregarCategoria={() => setMostrarModalCategoria(true)}
          />
        );
      default:
        return (
          <PantallaGastos
            gastos={gastosState.lista}
            totalGastos={obtenerTotalGastos()}
            onAgregarGasto={() => setMostrarModalAgregar(true)}
            onEliminarGasto={manejarEliminarGasto}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Control de Gastos (Redux)</Text>
        {(gastosState.cargando || categoriasState.cargando) && (
          <Text style={styles.cargando}>Cargando...</Text>
        )}
      </View>

      <Navegacion 
        pantallaActual={pantallActual}
        onCambiarPantalla={setPantallaActual}
      />

      {renderizarPantallaActual()}
      
      <ModalAgregarGasto
        visible={mostrarModalAgregar}
        nuevoGasto={nuevoGasto}
        categorias={categoriasState.lista}
        onCambiarGasto={setNuevoGasto}
        onGuardar={manejarAgregarGasto}
        onCerrar={() => setMostrarModalAgregar(false)}
      />

      <ModalAgregarCategoria
        visible={mostrarModalCategoria}
        nuevaCategoria={nuevaCategoria}
        onCambiarCategoria={setNuevaCategoria}
        onGuardar={manejarAgregarCategoria}
        onCerrar={() => setMostrarModalCategoria(false)}
      />
    </View>
  );
}

// Componente raíz con Provider
export default function App() {
  return (
    <Provider store={store}>
      <AppConRedux />
    </Provider>
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
  cargando: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
