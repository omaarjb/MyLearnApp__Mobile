import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGradeColor } from '../utils/helpers';

const QuizResultItem = ({ title, subtitle, score, totalQuestions, grade }) => {
  const gradeColor = getGradeColor(grade);
  
  return (
    <View style={styles.quizResultItem}>
      <View style={styles.quizResultLeft}>
        <Text style={styles.quizResultTitle}>{title}</Text>
        <Text style={styles.quizResultSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.quizResultRight}>
        <View style={[styles.gradeBadge, { backgroundColor: `${gradeColor}20` }]}>
          <Text style={[styles.gradeBadgeText, { color: gradeColor }]}>
            {grade}
          </Text>
        </View>
        <Text style={styles.quizResultScore}>
          {score}/{totalQuestions}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quizResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  quizResultLeft: {
    flex: 1,
    paddingRight: 8,
  },
  quizResultTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  quizResultSubtitle: {
    fontSize: 12,
    color: "#666666",
  },
  quizResultRight: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  gradeBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  quizResultScore: {
    fontSize: 12,
    color: "#666666",
  },
});

export default QuizResultItem;