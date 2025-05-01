import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGradeColor } from '../utils/helpers';

const GradeDistributionChart = ({ distribution }) => {
  const maxCount = Math.max(...distribution.map(item => item.count), 1);
  
  return (
    <View style={styles.gradeChartContainer}>
      {distribution.map((item) => (
        <View key={item.grade} style={styles.gradeChartColumn}>
          <View style={styles.gradeBarContainer}>
            <View 
              style={[
                styles.gradeBar, 
                { 
                  height: `${Math.max((item.count / maxCount) * 100, 5)}%`,
                  backgroundColor: getGradeColor(item.grade)
                }
              ]}
            />
          </View>
          <View style={[styles.gradeDot, { backgroundColor: getGradeColor(item.grade) }]} />
          <Text style={styles.gradeLabel}>{item.grade}</Text>
          <Text style={styles.gradeCount}>{item.count}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gradeChartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  gradeChartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  gradeBarContainer: {
    width: 24,
    height: '75%',
    justifyContent: 'flex-end',
  },
  gradeBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  gradeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  gradeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  gradeCount: {
    fontSize: 10,
    color: '#666666',
  },
});

export default GradeDistributionChart;