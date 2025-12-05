# Control de Gastos - Con Redux y Geolocalización

Una aplicación de React Native para controlar gastos personales usando Redux para la gestión de estado y geolocalización.

## Características

- ✅ Agregar gastos con descripción y cantidad
- ✅ Categorizar gastos
- ✅ Ver lista de todos los gastos
- ✅ Eliminar gastos
- ✅ Agregar categorías personalizadas
- ✅ Base de datos SQLite local
- ✅ **Gestión de estado con Redux**
- ✅ **📍 Información de ubicación actual**
- ✅ **🌍 Geolocalización con expo-location**
- ✅ **🗺️ Vista de gastos con información de ubicación**

## Tecnologías Usadas

- React Native
- Expo
- SQLite (expo-sqlite)
- React Hooks (useState, useEffect)
- **Redux Toolkit**
- **React-Redux**
- **expo-location (Geolocalización)**

## Estructura con Redux

```
├── App.js                    # Archivo principal con Provider de Redux
├── redux/                    # Gestión de estado con Redux
│   ├── store.js             # Configuración del store
│   ├── gastosSlice.js       # Slice para gestión de gastos
│   └── categoriasSlice.js   # Slice para gestión de categorías
├── components/               # Componentes reutilizables
│   ├── ElementoGasto.js     # Componente para mostrar un gasto
│   ├── Navegacion.js        # Componente de navegación entre pantallas
│   ├── ModalAgregarGasto.js # Modal para agregar gastos
│   └── ModalAgregarCategoria.js # Modal para agregar categorías
├── pantallas/               # Pantallas principales de la app
│   ├── PantallaGastos.js    # Pantalla de lista de gastos
│   ├── PantallaCategorias.js # Pantalla de categorías
│   └── PantallaMapaGastos.js # 📍 Pantalla con ubicación y gastos
├── database/
│   └── database.js          # Operaciones de base de datos
└── package.json             # Dependencias incluyendo Redux

```

## Instalación

```bash
npm install
npm start
```

## Cómo funciona la app

La aplicación tiene **3 pantallas principales**:

1. **💰 Gastos**: Lista todos los gastos y permite agregar/eliminar
2. **📂 Categorías**: Permite ver y agregar nuevas categorías
3. **📍 Ubicación**: Muestra tu ubicación actual y resumen de gastos

## Funcionalidad de Ubicación 🗺️

### ¿Qué hace?
- **📍 Ubicación actual**: Obtiene y muestra tu posición GPS
- **🏠 Dirección legible**: Convierte coordenadas en dirección real
- **💰 Resumen de gastos**: Visualiza estadísticas en la misma pantalla
- **📋 Gastos recientes**: Lista los últimos 5 gastos registrados
- **🗺️ Enlace a Maps**: Botón para abrir Google Maps

### Permisos necesarios:
- **Ubicación**: La app solicita permisos para acceder a tu ubicación
- **Configurado**: Los permisos ya están configurados en `app.json`

### Tecnologías usadas:
- `expo-location`: Para obtener ubicación y dirección
- **Redux**: Los datos de gastos vienen del store global
- **Geocoding reverso**: Convierte coordenadas en direcciones

## Para Principiantes - Redux vs useState

### **useState (Estado Local):**
```javascript
const [gastos, setGastos] = useState([]);
const [categorias, setCategorias] = useState([]);
```

### **Redux (Estado Global):**
```javascript
const gastos = useSelector(state => state.gastos.lista);
const categorias = useSelector(state => state.categorias.lista);
const dispatch = useDispatch();

// Agregar gasto
dispatch(gastoAgregado(nuevoGasto));
```

### **Ventajas de Redux:**

- ✅ Estado centralizado
- ✅ Compartir datos entre pantallas
- ✅ Acciones predecibles
- ✅ Fácil debugging
- ✅ Mejor para apps grandes

### **Cuándo usar cada uno:**

- **useState**: Modales, inputs, estado de UI
- **Redux**: Datos de la aplicación (gastos, categorías, usuario)

## Arquitectura Redux Simplificada

Esta implementación usa **Redux simplificado** para principiantes:

### **Slices sin extraReducers:**
```javascript
// En lugar de extraReducers complejos
reducers: {
  gastoAgregado: (state, action) => {
    state.lista.unshift(action.payload);
  },
  categoriasRecibidas: (state, action) => {
    state.lista = action.payload;
  }
}
```

### **Acciones directas:**
```javascript
// Agregar gasto (simple y directo)
1. Guardar en base de datos
2. dispatch(gastoAgregado(nuevoGasto))
3. UI se actualiza inmediatamente
```

## Conceptos Aprendidos

### **Redux Básico:**
- Store centralizado
- Slices con reducers simples
- useSelector y useDispatch
- Acciones síncronas

### **Geolocalización:**
- Solicitud de permisos
- Obtención de coordenadas GPS
- Geocoding reverso (coordenadas → dirección)
- Manejo de errores de ubicación

### **Integración:**
- Redux + geolocalización
- Estados de carga para UX
- Navegación entre funcionalidades
- Base de datos + Redux

¡Este proyecto te enseña Redux y geolocalización de manera práctica y sencilla! 🚀
