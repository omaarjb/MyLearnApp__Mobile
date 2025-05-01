import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRandomColor } from '../utils/helpers';

const CategoryDistributionChart = ({ categories }) => {
  const totalQuizzes = categories.reduce((sum, cat) => sum + cat.count, 0);
  let runningPercentage = 0;
  
  return (
    <View style={styles.categoryChartContainer}>
      <View style={styles.categoryBars}>
        {categories.map((category, index) => {
          const percentage = (category.count / totalQuizzes) * 100;
          const currentStart = runningPercentage;
          runningPercentage += percentage;
          
          return (
            <View 
              key={index}
              style={[
                styles.categorySegment,
                {
                  width: `${percentage}%`,
                  backgroundColor: category.color || getRandomColor(index),
                  left: `${currentStart}%`
                }
              ]}
            />
          );
        })}
      </View>
      
      <View style={styles.categoryLegend}>
        {categories.map((category, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                {backgroundColor: category.color || getRandomColor(index)}
              ]} 
            />
            <Text style={styles.legendText}>
              {category.name} ({category.count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryChartContainer: {
    marginBottom: 16,
  },
  categoryBars: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  categorySegment: {
    height: '100%',
    position: 'absolute',
  },
  categoryLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
});

export default CategoryDistributionChart;