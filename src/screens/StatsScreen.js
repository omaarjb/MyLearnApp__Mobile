"use client"

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  StyleSheet,
  Dimensions
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { apiUrl } from "../api/apiUrl";

import StatCard from "../components/StatCard";
import PerformanceItem from "../components/PerformanceItem";
import QuizResultItem from "../components/QuizResultItem";
import GradeDistributionChart from "../components/GradeDistributionChart";
import CategoryDistributionChart from "../components/CategoryDistributionChart";
import FilterSection from "../components/FilterSection";
import { 
  getGradeColor, 
  getGradeFromScore, 
  getCategoryDistribution 
} from "../utils/helpers";

const { width } = Dimensions.get("window");

const StatsScreen = () => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [topics, setTopics] = useState(["all"]);
  const [emptyState, setEmptyState] = useState(false);

  const grades = ["all", "A", "B", "C", "D", "F"];

  useEffect(() => {
    if (user && isLoaded) {
      const clerkId = user.id;

      fetch(`${apiUrl}/quiz-attempts/user/${clerkId}`)
        .then(async (response) => {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse JSON:", e);
            throw new Error("Invalid JSON response from server");
          }
        })
        .then((data) => {
          if (!Array.isArray(data) || data.length === 0) {
            setQuizAttempts([]);
            setTopics(["all"]);
            setEmptyState(true);
          } else {
            const attemptsWithGrades = data.map((attempt) => ({
              ...attempt,
              topic: attempt.quizCategory || "non-catégorisé",
              grade: getGradeFromScore(attempt.score),
            }));

            setQuizAttempts(attemptsWithGrades);
            setTopics([
              "all",
              ...new Set(attemptsWithGrades.map((attempt) => attempt.topic || "non-catégorisé")),
            ]);
            setEmptyState(false);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching quiz attempts:", error.message);
          setError(error.message);
          setLoading(false);
          setEmptyState(true);
        });
    }
  }, [user, isLoaded]);

  const filteredQuizAttempts = quizAttempts.filter((attempt) => {
    const topicMatch = selectedTopic === "all" || attempt.topic === selectedTopic;
    const gradeMatch = selectedGrade === "all" || attempt.grade === selectedGrade;
    return topicMatch && gradeMatch;
  });

  const calculateStats = () => {
    if (filteredQuizAttempts.length === 0) {
      return {
        completedQuizzes: 0,
        averageScore: 0,
        bestGrade: "-",
        totalPoints: 0,
      };
    }

    const totalScore = filteredQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = Math.round(totalScore / filteredQuizAttempts.length);
    const bestAttempt = filteredQuizAttempts.reduce(
      (best, attempt) => (attempt.score > best.score ? attempt : best),
      filteredQuizAttempts[0],
    );

    return {
      completedQuizzes: filteredQuizAttempts.length,
      averageScore,
      bestGrade: bestAttempt.grade || getGradeFromScore(bestAttempt.score),
      totalPoints: totalScore,
    };
  };

  const stats = calculateStats();

  const getTopicPerformance = () => {
    const topicPerformance = [];
    const uniqueTopics = new Set(quizAttempts.map(attempt => attempt.topic));
    
    uniqueTopics.forEach(topic => {
      if (!topic) return;
      
      const topicAttempts = quizAttempts.filter(attempt => attempt.topic === topic);
      const avgScore = Math.round(
        topicAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / topicAttempts.length
      );
      
      topicPerformance.push({
        topic,
        avgScore,
        count: topicAttempts.length
      });
    });
    
    return topicPerformance;
  };

  const getGradeDistribution = () => {
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    
    quizAttempts.forEach(attempt => {
      gradeCount[attempt.grade]++;
    });
    
    return grades.filter(grade => grade !== "all").map(grade => ({
      grade,
      count: gradeCount[grade],
      percentage: quizAttempts.length > 0 
        ? Math.round((gradeCount[grade] / quizAttempts.length) * 100) 
        : 0
    }));
  };

  if (!isLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Chargement de vos statistiques...</Text>
      </View>
    );
  }

  if (emptyState || quizAttempts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vos Statistiques</Text>
          <Text style={styles.headerSubtitle}>Suivez votre progression</Text>
        </View>
        <View style={styles.emptyStateContainer}>
          <Feather name="bar-chart-2" size={70} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>Pas encore de statistiques</Text>
          <Text style={styles.emptyStateSubtitle}>
            Complétez des quiz pour voir votre progression et vos statistiques apparaître ici
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {error && (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={18} color="#F59E0B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filtrer par:</Text>
        <View style={styles.filterSections}>
          <FilterSection
            label="Sujet"
            options={topics}
            selectedValue={selectedTopic}
            onSelect={setSelectedTopic}
            displayText={(value) => value === "all" ? "Tous" : value}
          />
          <View style={{ width: 12 }} />
          <FilterSection
            label="Note"
            options={grades}
            selectedValue={selectedGrade}
            onSelect={setSelectedGrade}
            displayText={(value) => value === "all" ? "Toutes" : value}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Stats Cards */}
          <View style={styles.statsCardsContainer}>
            <View style={styles.statsRow}>
              <StatCard 
                icon="book-open" 
                value={stats.completedQuizzes} 
                label="Quiz Complétés" 
              />
              <StatCard 
                icon="activity" 
                value={`${stats.averageScore}%`} 
                label="Score Moyen" 
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard 
                icon="award" 
                value={stats.bestGrade} 
                label="Meilleure Note" 
                valueColor={getGradeColor(stats.bestGrade)}
              />
              <StatCard 
                icon="bar-chart-2" 
                value={stats.totalPoints} 
                label="Points Totaux" 
              />
            </View>
          </View>

          {/* Grade Distribution */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Distribution des Notes</Text>
            <GradeDistributionChart distribution={getGradeDistribution()} />
            
            <View style={styles.distributionStats}>
              {getGradeDistribution().map(item => (
                <View key={item.grade} style={styles.distributionStatItem}>
                  <Text style={[styles.distributionGrade, {color: getGradeColor(item.grade)}]}>
                    {item.grade}:
                  </Text>
                  <Text style={styles.distributionValue}>
                    {item.count} quiz ({item.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Category Distribution */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Répartition par Catégorie</Text>
            <CategoryDistributionChart categories={getCategoryDistribution(quizAttempts)} />
          </View>

          {/* Performance by Topic */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Performance par Sujet</Text>
            {getTopicPerformance().map(item => (
              <PerformanceItem 
                key={item.topic}
                topic={item.topic}
                score={item.avgScore}
                count={item.count}
              />
            ))}
          </View>

          {/* Grade Distribution as bars */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Détails des Notes</Text>
            {getGradeDistribution().map(item => (
              <PerformanceItem 
                key={item.grade}
                topic={`Note ${item.grade}`}
                score={item.percentage}
                count={item.count}
                color={getGradeColor(item.grade)}
              />
            ))}
          </View>

          {/* Recent Quiz Results */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Résultats Récents</Text>
            {filteredQuizAttempts.slice(0, 5).map((attempt, index) => (
              <QuizResultItem
                key={index}
                title={attempt.quizTitle}
                subtitle={`${attempt.topic} • ${new Date(attempt.endTime).toLocaleDateString()}`}
                score={attempt.score}
                totalQuestions={attempt.totalQuestions}
                grade={attempt.grade}
              />
            ))}
            
            {filteredQuizAttempts.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllButtonText}>Voir tous les résultats</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    // paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#92400E",
    marginLeft: 8,
  },
  filtersContainer: {
    // paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333333",
  },
  filterSections: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsCardsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  sectionContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  distributionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  distributionStatItem: {
    flexDirection: 'row',
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  distributionGrade: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  distributionValue: {
    fontSize: 14,
    color: '#666666',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: "#6C47FF",
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default StatsScreen;