import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentMonthExpenses } from '../store/expenseSlice';
import { fetchCategories } from '../store/categorySlice';
import { getCurrentLocation } from '../store/locationSlice';
import { statsOperations } from '../database/database';

const DashboardScreen = ({ refreshControl }) => {
  const dispatch = useDispatch();
  const { currentMonthExpenses, totalSpent, loading } = useSelector(state => state.expenses);
  const { categories } = useSelector(state => state.categories);
  const { address, loading: locationLoading } = useSelector(state => state.location);

  const [monthlyStats, setMonthlyStats] = React.useState([]);
  const [totalBudget, setTotalBudget] = React.useState(0);

  useEffect(() => {
    loadMonthlyStats();
  }, [categories]);

  const loadMonthlyStats = async () => {
    try {
      const stats = await statsOperations.getCurrentMonthSummary();
      setMonthlyStats(stats);
      
      // Calcular presupuesto total
      const budget = stats.reduce((sum, stat) => sum + (stat.monthly_budget || 0), 0);
      setTotalBudget(budget);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getProgressPercentage = () => {
    if (totalBudget === 0) return 0;
    return Math.min((totalSpent / totalBudget) * 100, 100);
  };

  const getBudgetStatus = () => {
    const percentage = getProgressPercentage();
    if (percentage > 100) return { status: 'over', color: '#FF4444' };
    if (percentage > 80) return { status: 'warning', color: '#FFA726' };
    return { status: 'good', color: '#4CAF50' };
  };

  const handleLocationPress = async () => {
    try {
      await dispatch(getCurrentLocation());
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>${totalSpent.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Gastado este mes</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>${totalBudget.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Presupuesto total</Text>
      </View>
    </View>
  );

  const renderProgressBar = () => {
    const { color } = getBudgetStatus();
    const percentage = getProgressPercentage();
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progreso del Presupuesto</Text>
          <Text style={[styles.progressPercentage, { color }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
            ]} 
          />
        </View>
        {percentage > 100 && (
          <Text style={styles.overBudgetText}>
            ¡Has superado tu presupuesto por ${(totalSpent - totalBudget).toLocaleString()}!
          </Text>
        )}
      </View>
    );
  };

  const renderCategoryStats = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
      {monthlyStats.map((stat, index) => (
        <View key={stat.category_name} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>{stat.category_icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{stat.category_name}</Text>
              <View style={styles.categoryAmounts}>
                <Text style={styles.categorySpent}>
                  ${stat.spent.toLocaleString()}
                </Text>
                <Text style={styles.categoryBudget}>
                  / ${stat.monthly_budget.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.categoryProgressContainer}>
            <View 
              style={[
                styles.categoryProgress,
                { 
                  width: `${Math.min((stat.spent / stat.monthly_budget) * 100, 100)}%`,
                  backgroundColor: stat.spent > stat.monthly_budget ? '#FF4444' : stat.color
                }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecentExpenses = () => {
    const recentExpenses = currentMonthExpenses.slice(0, 5);
    
    return (
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Gastos Recientes</Text>
        {recentExpenses.length === 0 ? (
          <Text style={styles.noDataText}>No hay gastos registrados</Text>
        ) : (
          recentExpenses.map((expense, index) => (
            <View key={expense.id} style={styles.expenseItem}>
              <Text style={styles.expenseIcon}>{expense.category_icon}</Text>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseCategory}>{expense.category_name}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ${expense.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {/* Fecha actual */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{getCurrentDate()}</Text>
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={handleLocationPress}
          disabled={locationLoading}
        >
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {locationLoading ? 'Obteniendo...' : address || 'Obtener ubicación'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas rápidas */}
      {renderQuickStats()}

      {/* Barra de progreso */}
      {renderProgressBar()}

      {/* Estadísticas por categoría */}
      {renderCategoryStats()}

      {/* Gastos recientes */}
      {renderRecentExpenses()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 15,
  },
  dateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E6ED',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  overBudgetText: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySpent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495E',
  },
  categoryBudget: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 5,
  },
  categoryProgressContainer: {
    height: 6,
    backgroundColor: '#E0E6ED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 3,
  },
  recentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noDataText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});

export default DashboardScreen;
