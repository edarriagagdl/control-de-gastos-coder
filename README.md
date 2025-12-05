# Control de Gastos - Con Redux y Geolocalización

Una aplicación de React Native para controlar gastos personales usando SQLLite,  Redux para la gestión de estado y geolocalización.

## Tecnologías Usadas

- React Native
- Expo
- SQLite (expo-sqlite)
- React Hooks (useState, useEffect)
- **Redux Toolkit**
- **React-Redux**
- **expo-location (Geolocalización)**

## Cómo funciona la app

La aplicación tiene **3 pantallas principales**:

1. **💰 Gastos**: Lista todos los gastos y permite agregar/eliminar
2. **📂 Categorías**: Permite ver y agregar nuevas categorías
3. **📍 Ubicación**: Muestra tu ubicación actual y resumen de gastos

### Permisos necesarios:
- **Ubicación**: La app solicita permisos para acceder a tu ubicación
- **Configurado**: Los permisos ya están configurados en `app.json`

### Tecnologías usadas:
- `expo-location`: Para obtener ubicación y dirección
- **Redux**: Los datos de gastos vienen del store global
- **Geocoding reverso**: Convierte coordenadas en direcciones

