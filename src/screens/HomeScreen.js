"use client"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { clearSession } from "../utils/session"
import { useEffect, useCallback, useState, useRef } from "react"
import { Feather } from "@expo/vector-icons"
import { Keyboard, TouchableWithoutFeedback } from "react-native"
import { ProfileCard } from "../components/profile-card"
import  {apiUrl}  from "../api/apiUrl"
import QuizCard from "../components/quiz-card" 
import StatsScreen from "./StatsScreen" 

const { width } = Dimensions.get("window")
const SIDEBAR_WIDTH = 250

const HomeScreen = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigation = useNavigation()
  const [activeSection, setActiveSection] = useState("home")
  const [sidebarVisible, setSidebarVisible] = useState(false)


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

  // Animation value for sidebar
  const sidebarPosition = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -SIDEBAR_WIDTH : 0

    Animated.timing(sidebarPosition, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start()

    setSidebarVisible(!sidebarVisible)
  }

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

  // Prevent going back to sign-in screen after logging in
  useFocusEffect(
    useCallback(() => {
      // Disable the back button when this screen is focused
      const onBackPress = () => {
        if (sidebarVisible) {
          toggleSidebar()
          return true
        }
        return true // Return true to prevent default behavior (going back)
      }

      // Add event listener for hardware back button press
      BackHandler.addEventListener("hardwareBackPress", onBackPress)

      // Cleanup function to remove the event listener when the component unmounts
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    }, [sidebarVisible]),
  )

  // Set navigation options to hide back button in header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // This removes the back button from header
      gestureEnabled: false, // This disables swipe-back gesture on iOS
      headerShown: false, // Hide the header completely
    })
  }, [navigation])

  const handleSignOut = async () => {
    try {
      await clearSession(signOut) // Pass signOut as parameter
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      })
    } catch (err) {
      console.error("Sign out failed:", err)
    }
  }

  const startQuiz = (quiz) => {
    // Navigate to quiz screen with quiz data
    navigation.navigate("Quiz", { quiz })
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

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Explorer les Quiz</Text>

            {/* Search and Filter UI */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#666666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Recherhcer les Quiz..."
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
                    <Text style={styles.resetFiltersText}>Resetaurer les filtres</Text>
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
      case "myquizzes":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>My Quizzes</Text>
            <View style={styles.emptyStateContainer}>
              <Feather name="book-open" size={50} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>You haven't taken any quizzes yet</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={() => handleMenuItemPress("home")}>
                <Text style={styles.emptyStateButtonText}>Explore Quizzes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      case "statistics":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Mes Statistiques</Text>
            
              <StatsScreen />
            
        </View>
        )
      case "profile":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>My Profile</Text>
            <ProfileCard />
          </View>
        )
      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Welcome</Text>
          </View>
        )
    }
  }

  const handleMenuItemPress = (section) => {
    setActiveSection(section)
    // On smaller screens, close the sidebar after selection
    if (width < 768) {
      toggleSidebar()
    }
  }

  return (
    <View style={styles.container}>
      {/* Overlay when sidebar is visible on small screens */}
      {sidebarVisible && width < 768 && (
        <TouchableOpacity style={styles.overlay} activeOpacity={0.7} onPress={toggleSidebar} />
      )}

      {/* Animated Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarPosition }] }]}>
        <View style={styles.sidebarHeader}>
          <Image
            source={{
              uri: user?.imageUrl || "https://via.placeholder.com/100",
            }}
            style={styles.sidebarProfileImage}
          />
          <Text style={styles.sidebarName}>{user?.fullName || "User"}</Text>
          <Text style={styles.sidebarEmail}>{user?.primaryEmailAddress?.emailAddress || "No email"}</Text>
        </View>

        <View style={styles.sidebarMenu}>
          <TouchableOpacity
            style={[styles.sidebarMenuItem, activeSection === "home" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("home")}
          >
            <Feather name="home" size={20} color={activeSection === "home" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "home" && styles.activeMenuText]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarMenuItem, activeSection === "myquizzes" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("myquizzes")}
          >
            <Feather name="book-open" size={20} color={activeSection === "myquizzes" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "myquizzes" && styles.activeMenuText]}>
              My Quizzes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarMenuItem, activeSection === "statistics" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("statistics")}
          >
            <Feather name="bar-chart-2" size={20} color={activeSection === "statistics" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "statistics" && styles.activeMenuText]}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarMenuItem, activeSection === "profile" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("profile")}
          >
            <Feather name="user" size={20} color={activeSection === "profile" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "profile" && styles.activeMenuText]}>Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color="#FFFFFF" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      
      <View style={styles.mainContent}>
        <View style={styles.header}>
          {/* Menu toggle button */}
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
            <Feather name={sidebarVisible ? "x" : "menu"} size={24} color="#1A1A1A" />
          </TouchableOpacity>

          {/* <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>{user?.firstName || "User"}</Text> */}
        </View>

        {renderContent()}
      </View>
      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#F8F9FA",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    zIndex: 2,
    elevation: 5, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  sidebarProfileImage: {
    marginTop: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  sidebarName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
    textAlign: "center",
  },
  sidebarEmail: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  sidebarMenu: {
    flex: 1,
    marginTop: 20,
  },
  sidebarMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: "rgba(108, 71, 255, 0.1)",
  },
  sidebarMenuText: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 12,
  },
  activeMenuText: {
    color: "#6C47FF",
    fontWeight: "500",
  },
  signOutButton: {
    backgroundColor: "#6C47FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  menuButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 18,
    color: "#6C47FF",
    fontWeight: "500",
  },
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
  quizListContainer: {
    flex: 1,
  },
  quizCardsContainer: {
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6C47FF",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
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
  emptyStateSubText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
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
})

export default HomeScreen
