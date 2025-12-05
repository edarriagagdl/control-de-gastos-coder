# Control de Gastos - Con Redux

Una aplicación de React Native para controlar gastos personales usando Redux para la gestión de estado.

## Características

- ✅ Agregar gastos con descripción y cantidad
- ✅ Categorizar gastos
- ✅ Ver lista de todos los gastos
- ✅ Resumen con vista general básica
- ✅ Eliminar gastos
- ✅ Agregar categorías personalizadas
- ✅ Base de datos SQLite local
- ✅ **Gestión de estado con Redux**
- ✅ **Estados de carga y error**

## Tecnologías Usadas

- React Native
- Expo
- SQLite (expo-sqlite)
- React Hooks (useState, useEffect)
- **Redux Toolkit**
- **React-Redux**

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
│   ├── PantallaResumen.js   # Pantalla de resumen
│   ├── PantallaGastos.js    # Pantalla de lista de gastos
│   └── PantallaCategorias.js # Pantalla de categorías
├── database/
│   └── database.js          # Operaciones de base de datos
└── package.json             # Dependencias incluyendo Redux

```

## Instalación

```bash
npm install
npm start
```

## Cómo funciona con Redux

1. **Resumen**: Muestra un resumen del total gastado y los últimos gastos
2. **Gastos**: Lista todos los gastos y permite agregar nuevos
3. **Categorías**: Permite ver y agregar nuevas categorías

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
dispatch(agregarGasto(nuevoGasto));
```

### **Ventajas de Redux:**

- ✅ Estado centralizado
- ✅ Compartir datos entre pantallas
- ✅ Historial de cambios
- ✅ Estados de carga y error
- ✅ Mejor para apps grandes

### **Cuándo usar cada uno:**

- **useState**: Modales, inputs, estado de UI
- **Redux**: Datos de la aplicación (gastos, categorías, usuario)

¡Este proyecto te enseña Redux de manera práctica y sencilla! 🚀
