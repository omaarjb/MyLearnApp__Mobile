import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { extractColorFromTailwindGradient } from "../utils/color-converter"

// Icon mapping function for React Native
const getIconComponent = (iconName) => {
  switch (iconName) {
    case "Brain":
      return <Feather name="activity" size={24} color="white" />
    case "Zap":
      return <Feather name="zap" size={24} color="white" />
    case "Target":
      return <Feather name="target" size={24} color="white" />
    default:
      return <Feather name="book-open" size={24} color="white" />
  }
}

// Update the getDifficultyColor function to match the web version
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Débutant":
      return styles.beginnerBadge
    case "Intermédiaire":
      return styles.intermediateBadge
    case "Avancé":
      return styles.advancedBadge
    default:
      return styles.defaultBadge
  }
}

// Update the getDifficultyTextColor function to match the web version
const getDifficultyTextColor = (difficulty) => {
  switch (difficulty) {
    case "Débutant":
      return styles.beginnerText
    case "Intermédiaire":
      return styles.intermediateText
    case "Avancé":
      return styles.advancedText
    default:
      return styles.defaultText
  }
}

// Function to format time
const formatTime = (timeLimit, questionsCount) => {
  if (timeLimit) {
    const minutes = Math.floor(timeLimit / 60)
    const seconds = timeLimit % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `~${questionsCount * 30} sec`
  }
}

const QuizCard = ({ quiz, onPress }) => {
  // Extract primary and secondary colors from the gradient class
  const primaryColor = extractColorFromTailwindGradient(quiz.color)

  // Create gradient colors array
  // For simplicity, we'll use the same color with different opacities
  // In a more advanced implementation, you could extract both colors from the gradient
  const gradientColors = [primaryColor, primaryColor + "CC"] // CC is 80% opacity in hex

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(quiz)} activeOpacity={0.9}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>{getIconComponent(quiz.icon)}</View>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {quiz.title}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {quiz.description}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
              {quiz.category}
            </Text>
          </View>

          <View style={[styles.difficultyBadge, getDifficultyColor(quiz.difficulty)]}>
            <Text style={[styles.difficultyText, getDifficultyTextColor(quiz.difficulty)]}>
              {quiz.difficulty}
            </Text>
          </View>
        </View>

        {/* Professor information */}
        {quiz.professor && (
          <View style={styles.professorContainer}>
            <Feather name="user" size={16} color="#666" />
            <Text style={styles.professorText} numberOfLines={1} ellipsizeMode="tail">
              Professeur : {quiz.professor.firstName} {quiz.professor.lastName}
            </Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Feather name="book-open" size={16} color="#666" />
            <Text style={styles.statText}>{quiz.questions.length} questions</Text>
          </View>

          <View style={styles.statItem}>
            <Feather name="clock" size={16} color="#666" />
            <Text style={styles.statText}>{formatTime(quiz.timeLimit, quiz.questions.length)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={() => onPress(quiz)}>
          <Text style={styles.buttonText}>Commencer le Quiz</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
  },
  headerContent: {
    gap: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    flexWrap: "wrap",
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardContent: {
    padding: 16,
    paddingTop: 24,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    maxWidth: "60%",
  },
  categoryText: {
    fontSize: 12,
    color: "#4B5563",
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
  },
  // Difficulty styles
  beginnerBadge: {
    borderColor: "#10B981", // emerald-500
    backgroundColor: "rgba(16, 185, 129, 0.1)", // emerald-100 equivalent
  },
  beginnerText: {
    color: "#065F46", // emerald-800
  },
  intermediateBadge: {
    borderColor: "#F59E0B", // amber-500
    backgroundColor: "rgba(245, 158, 11, 0.1)", // amber-100 equivalent
  },
  intermediateText: {
    color: "#92400E", // amber-800
  },
  advancedBadge: {
    borderColor: "#F43F5E", // rose-500
    backgroundColor: "rgba(244, 63, 94, 0.1)", // rose-100 equivalent
  },
  advancedText: {
    color: "#9F1239", // rose-800
  },
  defaultBadge: {
    borderColor: "#3B82F6", // blue-500
    backgroundColor: "rgba(59, 130, 246, 0.1)", // blue-100 equivalent
  },
  defaultText: {
    color: "#1E40AF", // blue-800
  },
  professorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  professorText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#666666",
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})
export default QuizCard