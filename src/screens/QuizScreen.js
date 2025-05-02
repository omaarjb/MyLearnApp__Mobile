"use client"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from "react-native"
import { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"
import { apiUrl } from "../api/apiUrl"
import QuizCard from "../components/quiz-card"

const QuizScreen = ({ navigation }) => {
  // Quiz state
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "",
    category: "",
    professor: "",
  })
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/quizzes`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setQuizzes(data)

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((quiz) => quiz.category))].filter(Boolean)
        setCategories(uniqueCategories)

        setError(null)
      } catch (err) {
        setError("Unable to load quizzes. Please try again later.")
        console.error("Error fetching quizzes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const startQuiz = (quiz) => {
    // Navigate to quiz screen with quiz data
    navigation.navigate("PassQuiz", { quiz })
  }

  const handleSearchChange = (text) => {
    setFilters((prev) => ({ ...prev, search: text }))
  }

  const handleDifficultyFilter = (difficulty) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty === difficulty ? "" : difficulty,
    }))
  }

  const handleCategoryFilter = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      difficulty: "",
      category: "",
      professor: "",
    })
  }

  const filteredQuizzes = quizzes.filter((quiz) => {
    // Search filter
    if (
      filters.search &&
      !quiz.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !quiz.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Difficulty filter
    if (filters.difficulty && quiz.difficulty !== filters.difficulty) {
      return false
    }

    // Category filter
    if (filters.category && quiz.category !== filters.category) {
      return false
    }

    // Professor filter
    if (
      filters.professor &&
      (!quiz.professor || `${quiz.professor.firstName} ${quiz.professor.lastName}` !== filters.professor)
    ) {
      return false
    }

    return true
  })

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Explorer les Quiz</Text>

      {/* Search and Filter UI */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher les Quiz..."
            value={filters.search}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999999"
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Feather name="x" size={20} color="#666666" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, (filters.difficulty || filters.category) && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather
            name="filter"
            size={20}
            color={filters.difficulty || filters.category ? "#FFFFFF" : "#666666"}
          />
        </TouchableOpacity>
      </View>

      {/* Filter options */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Difficulté</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, filters.difficulty === "Débutant" && styles.activeFilterOption]}
                onPress={() => handleDifficultyFilter("Débutant")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.difficulty === "Débutant" && styles.activeFilterOptionText,
                  ]}
                >
                  Débutant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filters.difficulty === "Intermédiaire" && styles.activeFilterOption]}
                onPress={() => handleDifficultyFilter("Intermédiaire")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.difficulty === "Intermédiaire" && styles.activeFilterOptionText,
                  ]}
                >
                  Intermédiaire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, filters.difficulty === "Avancé" && styles.activeFilterOption]}
                onPress={() => handleDifficultyFilter("Avancé")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.difficulty === "Avancé" && styles.activeFilterOptionText,
                  ]}
                >
                  Avancé
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {categories.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                <View style={styles.filterOptions}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.filterOption, filters.category === category && styles.activeFilterOption]}
                      onPress={() => handleCategoryFilter(category)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.category === category && styles.activeFilterOptionText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {(filters.difficulty || filters.category) && (
            <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
              <Text style={styles.resetFiltersText}>Restaurer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C47FF" />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={50} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredQuizzes.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Feather name="search" size={50} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Aucun Quiz Trouvé !</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={resetFilters}>
            <Text style={styles.emptyStateButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.contentScrollView}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.quizCardsContainer}>
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onPress={startQuiz} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333333",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#6C47FF",
  },
  filtersContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333333",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#EEEEEE",
  },
  activeFilterOption: {
    backgroundColor: "#6C47FF",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  activeFilterOptionText: {
    color: "#FFFFFF",
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  resetFiltersButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetFiltersText: {
    color: "#6C47FF",
    fontSize: 14,
    fontWeight: "500",
  },
  contentScrollView: {
    flex: 1,
  },
  quizCardsContainer: {
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateButton: {
    backgroundColor: "#6C47FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default QuizScreen