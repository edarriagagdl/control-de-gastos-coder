import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { statsOperations, expenseOperations } from '../database/database';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = ({ refreshControl }) => {
  const { currentMonthExpenses, totalSpent } = useSelector(state => state.expenses);
  const { categories } = useSelector(state => state.categories);

  const [timeRange, setTimeRange] = useState('month'); // month, week, year
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [dailySpending, setDailySpending] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    loadStatsData();
  }, [timeRange, currentMonthExpenses]);

  const loadStatsData = async () => {
    try {
      const [monthly, daily] = await Promise.all([
        statsOperations.getCurrentMonthSummary(),
        statsOperations.getDailySpending(),
      ]);

      setMonthlyStats(monthly);
      setDailySpending(daily);

      // Preparar datos para gráfica de categorías
      const categoryData = monthly
        .filter(stat => stat.spent > 0)
        .map((stat, index) => ({
          name: stat.category_name,
          amount: stat.spent,
          color: stat.category_color || `hsl(${index * 45}, 70%, 60%)`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        }));

      setCategoryStats(categoryData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      month: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      year: now.getFullYear(),
      week: `Semana del ${now.getDate()}`,
    };
  };

  const getTotalBudget = () => {
    return monthlyStats.reduce((sum, stat) => sum + (stat.monthly_budget || 0), 0);
  };

  const getTopCategories = () => {
    return monthlyStats
      .filter(stat => stat.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3);
  };

  const prepareDailyChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = dailySpending.find(d => d.day === dateString);
      last7Days.push({
        day: date.getDate(),
        amount: dayData ? dayData.total : 0,
      });
    }

    return {
      labels: last7Days.map(d => d.day.toString()),
      datasets: [{
        data: last7Days.map(d => d.amount),
        color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>${totalSpent.toLocaleString()}</Text>
        <Text style={styles.summaryLabel}>Gastado este mes</Text>
        <View style={[styles.summaryIndicator, { backgroundColor: '#E74C3C' }]} />
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>${getTotalBudget().toLocaleString()}</Text>
        <Text style={styles.summaryLabel}>Presupuesto total</Text>
        <View style={[styles.summaryIndicator, { backgroundColor: '#4A90E2' }]} />
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>
          ${Math.max(0, getTotalBudget() - totalSpent).toLocaleString()}
        </Text>
        <Text style={styles.summaryLabel}>Restante</Text>
        <View style={[
          styles.summaryIndicator, 
          { backgroundColor: totalSpent > getTotalBudget() ? '#E74C3C' : '#27AE60' }
        ]} />
      </View>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <Text style={styles.sectionTitle}>Período de análisis</Text>
      <View style={styles.timeRangeButtons}>
        {[
          { key: 'week', label: 'Semana' },
          { key: 'month', label: 'Mes' },
          { key: 'year', label: 'Año' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.timeRangeButton,
              timeRange === option.key && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(option.key)}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === option.key && styles.timeRangeButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDailySpendingChart = () => {
    const chartData = prepareDailyChartData();
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gastos de los últimos 7 días</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#4A90E2',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#E0E6ED',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const renderCategoryPieChart = () => {
    if (categoryStats.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Gastos por Categoría</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No hay datos para mostrar</Text>
            <Text style={styles.noDataSubtext}>Registra algunos gastos para ver las estadísticas</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gastos por Categoría</Text>
        <PieChart
          data={categoryStats}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderTopCategories = () => {
    const topCategories = getTopCategories();
    
    return (
      <View style={styles.topCategoriesContainer}>
        <Text style={styles.sectionTitle}>Top Categorías del Mes</Text>
        {topCategories.length === 0 ? (
          <Text style={styles.noDataText}>No hay gastos registrados</Text>
        ) : (
          topCategories.map((category, index) => (
            <View key={category.category_name} style={styles.topCategoryItem}>
              <View style={styles.topCategoryRank}>
                <Text style={styles.topCategoryRankText}>{index + 1}</Text>
              </View>
              <Text style={styles.topCategoryIcon}>{category.category_icon}</Text>
              <View style={styles.topCategoryInfo}>
                <Text style={styles.topCategoryName}>{category.category_name}</Text>
                <Text style={styles.topCategoryPercentage}>
                  {((category.spent / totalSpent) * 100).toFixed(1)}% del total
                </Text>
              </View>
              <Text style={styles.topCategoryAmount}>
                ${category.spent.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderBudgetComparison = () => (
    <View style={styles.budgetContainer}>
      <Text style={styles.sectionTitle}>Comparación de Presupuesto</Text>
      {monthlyStats.map((stat) => {
        const percentage = stat.monthly_budget > 0 
          ? (stat.spent / stat.monthly_budget) * 100 
          : 0;
        const isOverBudget = percentage > 100;
        
        return (
          <View key={stat.category_name} style={styles.budgetItem}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetCategoryIcon}>{stat.category_icon}</Text>
              <View style={styles.budgetCategoryInfo}>
                <Text style={styles.budgetCategoryName}>{stat.category_name}</Text>
                <Text style={styles.budgetAmounts}>
                  ${stat.spent.toLocaleString()} / ${stat.monthly_budget.toLocaleString()}
                </Text>
              </View>
              <Text style={[
                styles.budgetPercentage,
                { color: isOverBudget ? '#E74C3C' : '#27AE60' }
              ]}>
                {percentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.budgetBarContainer}>
              <View 
                style={[
                  styles.budgetBar,
                  { 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOverBudget ? '#E74C3C' : stat.category_color
                  }
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {/* Resumen */}
      {renderSummaryCards()}

      {/* Selector de tiempo */}
      {renderTimeRangeSelector()}

      {/* Gráfica de gastos diarios */}
      {renderDailySpendingChart()}

      {/* Gráfica de torta por categorías */}
      {renderCategoryPieChart()}

      {/* Top categorías */}
      {renderTopCategories()}

      {/* Comparación de presupuesto */}
      {renderBudgetComparison()}

      {/* Spacer bottom */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  summaryIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
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
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: '#E0E6ED',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 5,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  topCategoriesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topCategoryRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topCategoryRankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topCategoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  topCategoryInfo: {
    flex: 1,
  },
  topCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  topCategoryPercentage: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  budgetContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetItem: {
    marginBottom: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  budgetCategoryInfo: {
    flex: 1,
  },
  budgetCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  budgetAmounts: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  budgetBarContainer: {
    height: 6,
    backgroundColor: '#E0E6ED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBar: {
    height: '100%',
    borderRadius: 3,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default StatsScreen;
