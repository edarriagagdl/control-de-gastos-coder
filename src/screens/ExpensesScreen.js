import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense, updateExpense, deleteExpense, fetchCurrentMonthExpenses } from '../store/expenseSlice';
import { getCurrentLocation } from '../store/locationSlice';

const ExpensesScreen = ({ refreshControl }) => {
  const dispatch = useDispatch();
  const { currentMonthExpenses, loading } = useSelector(state => state.expenses);
  const { categories } = useSelector(state => state.categories);
  const { currentLocation, address } = useSelector(state => state.location);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  const resetForm = () => {
    setFormData({
      category_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingExpense(null);
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category_id: expense.category_id.toString(),
        amount: expense.amount.toString(),
        description: expense.description,
        date: expense.date.split('T')[0],
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.category_id) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const expenseData = {
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location_name: address || null,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
      };

      if (editingExpense) {
        await dispatch(updateExpense({ id: editingExpense.id, expenseData }));
        Alert.alert('Éxito', 'Gasto actualizado correctamente');
      } else {
        await dispatch(addExpense(expenseData));
        Alert.alert('Éxito', 'Gasto agregado correctamente');
      }

      closeModal();
      dispatch(fetchCurrentMonthExpenses()); // Recargar datos
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
      console.error('Error guardando gasto:', error);
    }
  };

  const handleDelete = (expense) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar este gasto?\n\n"${expense.description}"`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteExpense(expense.id));
              Alert.alert('Éxito', 'Gasto eliminado correctamente');
              dispatch(fetchCurrentMonthExpenses());
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          },
        },
      ]
    );
  };

  const handleGetLocation = async () => {
    try {
      await dispatch(getCurrentLocation());
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderExpenseItem = (expense) => (
    <View key={expense.id} style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseMainInfo}>
          <Text style={styles.expenseIcon}>{expense.category_icon}</Text>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseCategory}>{expense.category_name}</Text>
            <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
            {expense.location_name && (
              <Text style={styles.expenseLocation}>📍 {expense.location_name}</Text>
            )}
          </View>
        </View>
        <Text style={styles.expenseAmount}>${expense.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.expenseActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openModal(expense)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(expense)}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {/* Categoría */}
            <Text style={styles.inputLabel}>Categoría *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona una categoría..." value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={`${category.icon} ${category.name}`}
                    value={category.id.toString()}
                  />
                ))}
              </Picker>
            </View>

            {/* Monto */}
            <Text style={styles.inputLabel}>Monto ($) *</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              placeholder="0.00"
              keyboardType="numeric"
            />

            {/* Descripción */}
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="¿En qué gastaste?"
              multiline
              numberOfLines={3}
            />

            {/* Fecha */}
            <Text style={styles.inputLabel}>Fecha</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />

            {/* Ubicación */}
            <Text style={styles.inputLabel}>Ubicación</Text>
            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
              <Text style={styles.locationButtonText}>
                📍 {address || 'Obtener ubicación actual'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {editingExpense ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header con botón agregar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gastos del Mes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de gastos */}
      <ScrollView
        style={styles.expensesList}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Cargando gastos...</Text>
          </View>
        )}

        {!loading && currentMonthExpenses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
            <Text style={styles.emptyText}>
              Toca el botón "+ Agregar" para registrar tu primer gasto
            </Text>
          </View>
        )}

        {!loading && currentMonthExpenses.map(renderExpenseItem)}
      </ScrollView>

      {/* Modal */}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseMainInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  expenseIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 2,
  },
  expenseLocation: {
    fontSize: 12,
    color: '#3498DB',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginHorizontal: 20,
    maxHeight: '90%',
    minWidth: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    fontSize: 24,
    color: '#7F8C8D',
    fontWeight: 'bold',
  },
  modalForm: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 10,
    backgroundColor: '#F8FAFB',
  },
  picker: {
    height: 50,
  },
  locationButton: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#4A90E2',
    fontWeight: '500',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ExpensesScreen;
