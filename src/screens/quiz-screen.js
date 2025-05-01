"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useAuth } from "@clerk/clerk-expo"
import { extractColorFromTailwindGradient, createLighterColor } from "../utils/color-converter"
import {apiUrl} from "../api/apiUrl"

const QuizScreen = ({ route }) => {
  const { quiz } = route.params
  const navigation = useNavigation()
  const { userId } = useAuth()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentAttemptId, setCurrentAttemptId] = useState(null)
  const [timeExpired, setTimeExpired] = useState(false)
  const timeCheckIntervalRef = useRef(null)
  const [timeLimit, setTimeLimit] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Start quiz on component mount
  useEffect(() => {
    startQuiz()
  }, [])

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (timerActive) {
          Alert.alert("Quit Quiz?", "Are you sure you want to quit? Your progress will be lost.", [
            { text: "Cancel", style: "cancel", onPress: () => {} },
            { text: "Quit", style: "destructive", onPress: () => navigation.goBack() },
          ])
          return true
        }
        return false
      }

      BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    }, [timerActive]),
  )

  // Timer for quiz duration - Updated to match web implementation
  useEffect(() => {
    let interval = null
    if (timerActive && !timeExpired) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1

          // Update time remaining if we have a time limit
          if (timeLimit > 0) {
            const remaining = timeLimit - newTimer
            setTimeRemaining(remaining)

            // If time is up, trigger the time expired flow
            if (remaining <= 0 && !timeExpired) {
              handleTimeExpired()
            }
          }

          return newTimer
        })
      }, 1000)
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLimit, timeExpired])

  // Periodic check for time limit on the server - Modified to match web implementation
  useEffect(() => {
    // Set up interval to check time limit on server
    if (currentAttemptId && timerActive && !timeExpired) {
      // Clear any existing interval
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
      }

      // Set new interval to check every 10 seconds - same as web version
      timeCheckIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`${apiUrl}/quiz-attempts/${currentAttemptId}/check-time`)

          if (!response.ok) {
            throw new Error("Failed to check time limit")
          }

          const data = await response.json()

          if (data.timeExceeded && !timeExpired) {
            handleTimeExpired()
          }
        } catch (err) {
          console.error("Error checking time limit:", err)
        }
      }, 10000) // Check every 10 seconds
    }

    // Clean up interval on unmount or when quiz is completed
    return () => {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
        timeCheckIntervalRef.current = null
      }
    }
  }, [currentAttemptId, timerActive, timeExpired])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current)
      }
    }
  }, [])

  const startQuiz = async () => {
    try {
      setLoading(true)

      // Start a new quiz attempt
      const response = await fetch(
        `${apiUrl}/quiz-attempts/start?clerkId=${userId}&quizId=${quiz.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start quiz attempt")
      }

      const data = await response.json()
      setCurrentAttemptId(data.attemptId)

      // Set up the quiz state
      setCurrentQuestion(0)
      setSelectedOptions({})
      setQuizCompleted(false)
      setScore(0)
      setTimer(0)
      setTimerActive(true)
      setTimeExpired(false)

      // Set time limit if the quiz has one - Ensure we're getting this correctly
      if (quiz.timeLimit) {
        console.log("Setting time limit to:", quiz.timeLimit)
        setTimeLimit(quiz.timeLimit)
        setTimeRemaining(quiz.timeLimit)
      } else {
        setTimeLimit(0)
        setTimeRemaining(0)
      }
    } catch (err) {
      setError(err.message || "Failed to start quiz")
      console.error("Error starting quiz:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId,
    })
  }

  const handleNextQuestion = async () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      await submitQuiz()
    }
  }

  const submitQuiz = async () => {
    try {
      setLoading(true)

      // Convert selectedOptions to the format expected by the API
      const responses = Object.entries(selectedOptions).reduce((acc, [questionId, optionId]) => {
        acc[questionId] = optionId
        return acc
      }, {})

      const response = await fetch(`${apiUrl}/quiz-attempts/${currentAttemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responses),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit quiz attempt")
      }

      const result = await response.json()

      setScore(result.correctAnswers)
      setQuizCompleted(true)
      setTimerActive(false)

      // Navigate to results screen
      navigation.navigate("QuizResults", {
        quiz,
        score: result.correctAnswers,
        totalQuestions: quiz.questions.length,
        timeSpent: timer,
        selectedOptions,
        timeExpired: false,
      })
    } catch (err) {
      setError(err.message || "Failed to submit quiz")
      console.error("Error submitting quiz:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeExpired = async () => {
    // Stop the timer
    setTimerActive(false)
    setTimeExpired(true)

    try {
      // Auto-submit the quiz with the server
      const response = await fetch(`${apiUrl}/quiz-attempts/${currentAttemptId}/auto-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to auto-submit quiz")
      }

      // Set score to 0
      setScore(0)
      setQuizCompleted(true)

      // Show alert and navigate to results
      Alert.alert(
        "Time Expired!",
        "The time limit for this quiz has expired. Your attempt has been automatically submitted.",
        [
          {
            text: "View Results",
            onPress: () =>
              navigation.navigate("QuizResults", {
                quiz,
                score: 0,
                totalQuestions: quiz.questions.length,
                timeSpent: timer,
                selectedOptions,
                timeExpired: true,
                timeLimit,
              }),
          },
        ],
      )
    } catch (err) {
      setError(err.message || "Failed to auto-submit quiz")
      console.error("Error auto-submitting quiz:", err)
    }
  }

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (loading && !quizCompleted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (timerActive) {
              Alert.alert("Quit Quiz?", "Are you sure you want to quit? Your progress will be lost.", [
                { text: "Cancel", style: "cancel", onPress: () => {} },
                { text: "Quit", style: "destructive", onPress: () => navigation.goBack() },
              ])
            } else {
              navigation.goBack()
            }
          }}
        >
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={[styles.quizHeader, { backgroundColor: extractColorFromTailwindGradient(quiz.color) }]}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <View style={styles.timerContainer}>
            {timeLimit > 0 && (
              <View
                style={[
                  styles.timerBadge,
                  timeRemaining < 60
                    ? styles.timerDanger
                    : timeRemaining < 180
                      ? styles.timerWarning
                      : styles.timerNormal,
                ]}
              >
                <Feather name="clock" size={14} color="#FFFFFF" />
                <Text style={styles.timerText}>Remaining: {formatTime(timeRemaining)}</Text>
              </View>
            )}
            <View style={styles.timerBadge}>
              <Feather name="clock" size={14} color="#FFFFFF" />
              <Text style={styles.timerText}>Duration: {formatTime(timer)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                  backgroundColor: extractColorFromTailwindGradient(quiz.color),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{quiz.questions[currentQuestion].text}</Text>

        <View style={styles.optionsContainer}>
          {quiz.questions[currentQuestion].options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOptions[quiz.questions[currentQuestion].id] === option.id && styles.selectedOption,
                selectedOptions[quiz.questions[currentQuestion].id] === option.id && {
                  borderColor: extractColorFromTailwindGradient(quiz.color),
                  backgroundColor: createLighterColor(extractColorFromTailwindGradient(quiz.color)),
                },
              ]}
              onPress={() => handleOptionSelect(quiz.questions[currentQuestion].id, option.id)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionCheckmark,
                    selectedOptions[quiz.questions[currentQuestion].id] === option.id && {
                      borderColor: extractColorFromTailwindGradient(quiz.color),
                      backgroundColor: extractColorFromTailwindGradient(quiz.color),
                    },
                  ]}
                >
                  {selectedOptions[quiz.questions[currentQuestion].id] === option.id && (
                    <Feather name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.quitButton}
          onPress={() => {
            Alert.alert("Quit Quiz?", "Are you sure you want to quit? Your progress will be lost.", [
              { text: "Cancel", style: "cancel", onPress: () => {} },
              { text: "Quit", style: "destructive", onPress: () => navigation.goBack() },
            ])
          }}
        >
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: extractColorFromTailwindGradient(quiz.color) },
            !selectedOptions[quiz.questions[currentQuestion].id] && styles.disabledButton,
          ]}
          disabled={!selectedOptions[quiz.questions[currentQuestion].id]}
          onPress={handleNextQuestion}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  quizHeader: {
    padding: 16,
    borderRadius: 12,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timerNormal: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  timerWarning: {
    backgroundColor: "rgba(255, 152, 0, 0.7)",
  },
  timerDanger: {
    backgroundColor: "rgba(244, 67, 54, 0.7)",
  },
  timerText: {
    color: "#FFFFFF", // Changed from "red" to white for better visibility
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: "#EEEEEE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: "#6C47FF",
    backgroundColor: "rgba(108, 71, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    marginBottom: 20,
  },
  quitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
  },
  quitButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#6C47FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#FFFFFF", // Changed from "red" to white
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#6C47FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default QuizScreen
