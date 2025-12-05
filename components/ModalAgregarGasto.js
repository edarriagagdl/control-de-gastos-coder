import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

const ModalAgregarGasto = ({ 
  visible, 
  nuevoGasto, 
  categorias, 
  onCambiarGasto, 
  onGuardar, 
  onCerrar 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>Nuevo Gasto</Text>
          
          <TextInput
            style={styles.input}
            placeholder="¿Cuánto gastaste?"
            value={nuevoGasto.cantidad}
            onChangeText={(text) => onCambiarGasto({...nuevoGasto, cantidad: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="¿En qué lo gastaste?"
            value={nuevoGasto.descripcion}
            onChangeText={(text) => onCambiarGasto({...nuevoGasto, descripcion: text})}
          />
          
          <View style={styles.selectorCategoria}>
            <Text>Categoría:</Text>
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.opcionCategoria,
                  nuevoGasto.categoria === cat.name && styles.categoriaSeleccionada
                ]}
                onPress={() => onCambiarGasto({...nuevoGasto, categoria: cat.name})}
              >
                <Text>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.botones}>
            <TouchableOpacity 
              style={styles.botonCancelar}
              onPress={onCerrar}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.botonGuardar}
              onPress={onGuardar}
            >
              <Text style={styles.textoGuardar}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenido: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  selectorCategoria: {
    marginBottom: 20,
  },
  opcionCategoria: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
    borderRadius: 5,
  },
  categoriaSeleccionada: {
    backgroundColor: '#3498db',
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonCancelar: {
    flex: 1,
    padding: 15,
    backgroundColor: '#95a5a6',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  botonGuardar: {
    flex: 1,
    padding: 15,
    backgroundColor: '#27ae60',
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
  textoGuardar: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ModalAgregarGasto;
