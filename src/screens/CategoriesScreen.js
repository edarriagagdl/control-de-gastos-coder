import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory, updateCategory, deleteCategory, fetchCategories } from '../store/categorySlice';

const CategoriesScreen = ({ refreshControl }) => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.categories);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#4A90E2',
    monthly_budget: '',
  });

  const availableIcons = [
    '🍕', '🚗', '🎬', '🏥', '📚', '🏠', '👕', '💼',
    '⚽', '🎵', '✈️', '🛒', '💄', '🔧', '📱', '🎮',
    '☕', '🍺', '💊', '🚌', '🎯', '📷', '🌟', '❤️'
  ];

  const availableColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#95A5A6',
    '#FF7675', '#00B894', '#0984E3', '#6C5CE7',
    '#FD79A8', '#FDCB6E', '#E17055', '#74B9FF'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '💰',
      color: '#4A90E2',
      monthly_budget: '',
    });
    setEditingCategory(null);
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        monthly_budget: category.monthly_budget ? category.monthly_budget.toString() : '',
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
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return false;
    }
    if (formData.monthly_budget && parseFloat(formData.monthly_budget) < 0) {
      Alert.alert('Error', 'El presupuesto debe ser un número positivo');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const categoryData = {
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
        monthly_budget: formData.monthly_budget ? parseFloat(formData.monthly_budget) : 0,
      };

      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, categoryData }));
        Alert.alert('Éxito', 'Categoría actualizada correctamente');
      } else {
        await dispatch(addCategory(categoryData));
        Alert.alert('Éxito', 'Categoría creada correctamente');
      }

      closeModal();
      dispatch(fetchCategories()); // Recargar categorías
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la categoría');
      console.error('Error guardando categoría:', error);
    }
  };

  const handleDelete = (category) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?\n\nEsto también eliminará todos los gastos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCategory(category.id));
              Alert.alert('Éxito', 'Categoría eliminada correctamente');
              dispatch(fetchCategories());
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la categoría');
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = (category) => (
    <View key={category.id} style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryMainInfo}>
          <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryBudget}>
              Presupuesto: ${category.monthly_budget.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openModal(category)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(category)}
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
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <Text style={styles.inputLabel}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ej: Alimentación, Transporte..."
            />

            {/* Icono */}
            <Text style={styles.inputLabel}>Icono</Text>
            <View style={styles.iconGrid}>
              {availableIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    formData.icon === icon && styles.iconOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, icon })}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color */}
            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.color === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, color })}
                />
              ))}
            </View>

            {/* Presupuesto mensual */}
            <Text style={styles.inputLabel}>Presupuesto Mensual ($)</Text>
            <TextInput
              style={styles.input}
              value={formData.monthly_budget}
              onChangeText={(text) => setFormData({ ...formData, monthly_budget: text })}
              placeholder="0.00"
              keyboardType="numeric"
            />

            {/* Vista previa */}
            <Text style={styles.inputLabel}>Vista Previa</Text>
            <View style={styles.previewCard}>
              <View style={[styles.previewIconContainer, { backgroundColor: formData.color + '20' }]}>
                <Text style={styles.previewIcon}>{formData.icon}</Text>
              </View>
              <View style={styles.previewDetails}>
                <Text style={styles.previewName}>
                  {formData.name || 'Nombre de la categoría'}
                </Text>
                <Text style={styles.previewBudget}>
                  ${formData.monthly_budget ? parseFloat(formData.monthly_budget).toLocaleString() : '0'}
                </Text>
              </View>
              <View style={[styles.previewColorIndicator, { backgroundColor: formData.color }]} />
            </View>
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
                {editingCategory ? 'Actualizar' : 'Crear'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorías</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de categorías */}
      <ScrollView
        style={styles.categoriesList}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No hay categorías</Text>
            <Text style={styles.emptyText}>
              Crea tu primera categoría para organizar tus gastos
            </Text>
          </View>
        )}

        {categories.map(renderCategoryItem)}
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
  categoriesList: {
    flex: 1,
    paddingHorizontal: 15,
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
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryMainInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  categoryBudget: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  categoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFB',
    borderWidth: 2,
    borderColor: '#E0E6ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  iconOptionText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#2C3E50',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  previewIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  previewIcon: {
    fontSize: 22,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  previewBudget: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  previewColorIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
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

export default CategoriesScreen;
