import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/categorySlice';
import { fetchCurrentMonthExpenses } from '../store/expenseSlice';
import { getCurrentLocation } from '../store/locationSlice';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import StatsScreen from '../screens/StatsScreen';

const MainApp = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const { loading: expensesLoading } = useSelector(state => state.expenses);
  const { loading: categoriesLoading } = useSelector(state => state.categories);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar datos principales
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchCurrentMonthExpenses()),
      ]);

      // Solicitar ubicación (opcional, no bloquea la app)
      try {
        await dispatch(getCurrentLocation());
      } catch (error) {
        console.log('Ubicación no disponible:', error.message);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const renderScreen = () => {
    const commonProps = {
      refreshControl: (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      )
    };

    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen {...commonProps} />;
      case 'expenses':
        return <ExpensesScreen {...commonProps} />;
      case 'categories':
        return <CategoriesScreen {...commonProps} />;
      case 'stats':
        return <StatsScreen {...commonProps} />;
      default:
        return <DashboardScreen {...commonProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 ExpenseTracker</Text>
        <Text style={styles.headerSubtitle}>
          {getTabTitle(activeTab)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TabButton
          icon="📊"
          label="Inicio"
          active={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
        />
        <TabButton
          icon="💳"
          label="Gastos"
          active={activeTab === 'expenses'}
          onPress={() => setActiveTab('expenses')}
        />
        <TabButton
          icon="📂"
          label="Categorías"
          active={activeTab === 'categories'}
          onPress={() => setActiveTab('categories')}
        />
        <TabButton
          icon="📈"
          label="Reportes"
          active={activeTab === 'stats'}
          onPress={() => setActiveTab('stats')}
        />
      </View>
    </SafeAreaView>
  );
};

// Componente para botones de navegación
const TabButton = ({ icon, label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Helper para títulos
const getTabTitle = (tab) => {
  const titles = {
    dashboard: 'Resumen del Mes',
    expenses: 'Registro de Gastos',
    categories: 'Gestión de Categorías',
    stats: 'Estadísticas y Reportes'
  };
  return titles[tab] || 'ExpenseTracker';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F4FD',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E6ED',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default MainApp;
