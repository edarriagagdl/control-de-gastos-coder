import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { inicializarBaseDatos } from './database/database';

// Redux
import { store } from './redux/store';
import { 
  cargarGastos, 
  agregarGasto, 
  eliminarGasto,
  gastosRecibidos,
  gastoAgregado,
  gastoEliminado,
  establecerCargando as establecerCargandoGastos
} from './redux/gastosSlice';
import { 
  cargarCategorias, 
  agregarCategoria,
  categoriasRecibidas,
  categoriaAgregada,
  establecerCargando as establecerCargandoCategorias
} from './redux/categoriasSlice';

// Importar componentes
import Navegacion from './components/Navegacion';
import ModalAgregarGasto from './components/ModalAgregarGasto';
import ModalAgregarCategoria from './components/ModalAgregarCategoria';

// Importar pantallas
import PantallaGastos from './pantallas/PantallaGastos';
import PantallaCategorias from './pantallas/PantallaCategorias';
import PantallaMapaGastos from './pantallas/PantallaMapaGastos';

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
    categoria: ''
  });
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    inicializarApp();
  }, []);

  // Actualizar categoría por defecto cuando se cargan las categorías
  useEffect(() => {
    if (categoriasState.lista.length > 0 && !nuevoGasto.categoria) {
      setNuevoGasto(prev => ({
        ...prev,
        categoria: categoriasState.lista[0].name
      }));
    }
  }, [categoriasState.lista]);

  const inicializarApp = async () => {
    try {
      await inicializarBaseDatos();
      // Cargar datos manualmente y actualizar Redux
      cargarDatos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo inicializar la aplicación');
    }
  };

  const cargarDatos = async () => {
    try {
      // Importar las operaciones de base de datos
      const { operacionesGastos, operacionesCategorias } = await import('./database/database');
      
      // Limpiar duplicados en categorías
      await operacionesCategorias.limpiarDuplicados();
      
      // Cargar gastos
      const gastos = await operacionesGastos.obtenerTodos();
      dispatch(gastosRecibidos(gastos));
      
      // Cargar categorías
      const categorias = await operacionesCategorias.obtenerTodas();
      dispatch(categoriasRecibidas(categorias));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const manejarAgregarGasto = async () => {
    if (!nuevoGasto.cantidad || !nuevoGasto.descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      // Importar operaciones de base de datos
      const { operacionesGastos } = await import('./database/database');
      
      // Agregar a la base de datos
      const hoy = new Date().toISOString().split('T')[0];
      await operacionesGastos.agregar(
        parseFloat(nuevoGasto.cantidad),
        nuevoGasto.descripcion,
        nuevoGasto.categoria,
        hoy
      );

      // Agregar al Redux
      const nuevoGastoCompleto = {
        id: Date.now(), // ID temporal
        amount: parseFloat(nuevoGasto.cantidad),
        description: nuevoGasto.descripcion,
        category: nuevoGasto.categoria,
        date: hoy
      };
      dispatch(gastoAgregado(nuevoGastoCompleto));

      // Limpiar formulario
      const primerCategoria = categoriasState.lista.length > 0 ? categoriasState.lista[0].name : '';
      setNuevoGasto({ cantidad: '', descripcion: '', categoria: primerCategoria });
      setMostrarModalAgregar(false);
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
              // Importar operaciones de base de datos
              const { operacionesGastos } = await import('./database/database');
              
              // Eliminar de la base de datos
              await operacionesGastos.eliminar(id);
              
              // Eliminar del Redux
              dispatch(gastoEliminado(id));
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
      // Importar operaciones de base de datos
      const { operacionesCategorias } = await import('./database/database');
      
      // Agregar a la base de datos
      await operacionesCategorias.agregar(nuevaCategoria);

      // Agregar al Redux
      const nuevaCategoriaCompleta = {
        id: Date.now(), // ID temporal
        name: nuevaCategoria
      };
      dispatch(categoriaAgregada(nuevaCategoriaCompleta));

      // Limpiar formulario
      setNuevaCategoria('');
      setMostrarModalCategoria(false);
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
      case 'mapa':
        return <PantallaMapaGastos />;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Control de Gastos</Text>
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
    </SafeAreaView>
  );
}

// Componente raíz con Provider y SafeAreaProvider
export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppConRedux />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498db', // Mismo color que el header para continuidad
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
