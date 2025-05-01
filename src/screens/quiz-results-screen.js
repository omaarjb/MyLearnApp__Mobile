import React, { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, SafeAreaView, StatusBar, Platform } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { extractColorFromTailwindGradient } from "../utils/color-converter"

const QuizResultsScreen = ({ route }) => {
  const { quiz, score, totalQuestions, timeSpent, selectedOptions, timeExpired, timeLimit } = route.params
  const navigation = useNavigation()
  
  // Animation values
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(20)
  const scaleTransform = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1]
  })
  
  useEffect(() => {
    // Fade in the entire card
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
    
    // Scale in the score circle
    Animated.spring(scaleAnim, {
      toValue: 1,
      stiffness: 200,
      damping: 15,
      delay: 200,
      useNativeDriver: true,
    }).start()
    
    // Slide up the result message
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      delay: 400,
      useNativeDriver: true,
    }).start()
  }, [])

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getResultMessage = () => {
    if (timeExpired) {
      return "Temps écoulé ! ⏱️"
    } else if (score === totalQuestions) {
      return "Parfait ! 🎉"
    } else if (score >= totalQuestions / 2) {
      return "Bon travail ! 👏"
    } else {
      return "Continuez à apprendre ! 💪"
    }
  }
  
  // Get color from quiz or use default
  const headerColor = quiz.color ? extractColorFromTailwindGradient(quiz.color) : "#6C47FF"

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.card,
            { 
              opacity: fadeAnim, 
              transform: [{ scale: scaleTransform }] 
            }
          ]}
        >
          <View style={[styles.header, { backgroundColor: headerColor }]}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.navigate("Home")}
            >
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Feather name="award" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Résultats du Quiz</Text>
              <Text style={styles.headerSubtitle}>{quiz.title}</Text>
            </View>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.scoreContainer}>
              <Animated.View 
                style={[
                  styles.scoreCircle,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <Text style={styles.scoreText}>
                  {score}/{totalQuestions}
                </Text>
              </Animated.View>
              
              <Animated.Text 
                style={[
                  styles.resultMessage,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
              >
                {getResultMessage()}
              </Animated.Text>
              
              <Animated.Text 
                style={[
                  styles.timeText,
                  { opacity: fadeAnim }
                ]}
              >
                {timeExpired ? (
                  <Text style={styles.timeExpiredText}>
                    Vous avez dépassé le temps limite de {formatTime(timeLimit)}
                  </Text>
                ) : (
                  `Temps total: ${formatTime(timeSpent)}`
                )}
              </Animated.Text>
            </View>

            <View style={styles.separator} />

            {timeExpired ? (
              <Animated.View 
                style={[
                  styles.timeExpiredContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <Feather name="alert-triangle" size={48} color="#FF9800" />
                <Text style={styles.timeExpiredTitle}>Quiz non complété</Text>
                <Text style={styles.timeExpiredDescription}>
                  Vous n'avez pas terminé le quiz dans le temps imparti. Votre score est de 0.
                </Text>
                <Text style={styles.timeExpiredTip}>
                  Essayez à nouveau pour améliorer votre temps de réponse.
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.questionsReview}>
                <Text style={styles.reviewTitle}>Révision des questions:</Text>

                {quiz.questions.map((question, index) => {
                  const selectedOption = question.options.find((o) => o.id === selectedOptions[question.id])
                  const isCorrect = selectedOption?.correct === true
                  const correctOption = question.options.find((o) => o.correct === true)

                  return (
                    <Animated.View
                      key={question.id}
                      style={[
                        styles.questionCard, 
                        isCorrect ? styles.correctCard : styles.incorrectCard,
                        { 
                          opacity: fadeAnim,
                          transform: [{ 
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            }) 
                          }] 
                        }
                      ]}
                    >
                      <View style={styles.questionHeader}>
                        {isCorrect ? (
                          <Feather name="check-circle" size={24} color="#4CAF50" style={styles.resultIcon} />
                        ) : (
                          <Feather name="x-circle" size={24} color="#F44336" style={styles.resultIcon} />
                        )}
                        <Text style={styles.questionText}>
                          {index + 1}. {question.text}
                        </Text>
                      </View>

                      <View style={styles.answerContainer}>
                        <Text style={[styles.answerLabel, isCorrect ? styles.correctText : styles.incorrectText]}>
                          Votre réponse: {selectedOption?.text || "Aucune réponse"}
                        </Text>

                        {!isCorrect && (
                          <Text style={styles.correctAnswerText}>
                            Réponse correcte: {correctOption?.text}
                          </Text>
                        )}
                      </View>
                    </Animated.View>
                  )
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: headerColor }]}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.footerButtonText}>Retour aux Quiz</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 16, // Reduced from 24
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginTop: 10, // Reduced from 16
    marginBottom: 10, // Reduced from 16
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    width: 48, // Reduced from 64
    height: 48, // Reduced from 64
    borderRadius: 24, // Reduced from 32
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12, // Reduced from 16
  },
  headerTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2, // Reduced from 4
  },
  headerSubtitle: {
    fontSize: 14, // Reduced from 16
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  scoreCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  resultMessage: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666666",
  },
  timeExpiredText: {
    color: "#F44336",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 24,
  },
  timeExpiredContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    marginBottom: 24,
  },
  timeExpiredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  timeExpiredDescription: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 8,
  },
  timeExpiredTip: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  questionsReview: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  correctCard: {
    borderColor: "rgba(76, 175, 80, 0.3)",
    backgroundColor: "rgba(76, 175, 80, 0.05)",
  },
  incorrectCard: {
    borderColor: "rgba(244, 67, 54, 0.3)",
    backgroundColor: "rgba(244, 67, 54, 0.05)",
  },
  questionHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  resultIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
  },
  answerContainer: {
    marginLeft: 36,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  correctText: {
    color: "#4CAF50",
  },
  incorrectText: {
    color: "#F44336",
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#F8F9FA",
  },
  footerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default QuizResultsScreen