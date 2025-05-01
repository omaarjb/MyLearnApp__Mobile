import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PerformanceItem = ({ topic, score, count, color = "#6C47FF" }) => (
  <View style={styles.performanceItem}>
    <View style={styles.performanceHeader}>
      <Text style={styles.performanceTopic}>{topic}</Text>
      <Text style={styles.performanceScore}>{score}%</Text>
    </View>
    <View style={styles.progressBarContainer}>
      <View 
        style={[styles.progressBar, { 
          width: `${score}%`,
          backgroundColor: color
        }]}
      />
    </View>
    <Text style={styles.quizCount}>{count} quiz{count > 1 ? 's' : ''}</Text>
  </View>
);

const styles = StyleSheet.create({
  performanceItem: {
    marginBottom: 16,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  performanceTopic: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  performanceScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  quizCount: {
    fontSize: 12,
    color: "#666666",
  },
});

export default PerformanceItem;