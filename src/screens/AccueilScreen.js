"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const { width, height } = Dimensions.get("window")

const AccueilScreen = ({ onSectionChange }) => {
  const { user, isLoaded } = useUser()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)

      // Start animations when content is loaded
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }, 1000)

    return () => clearTimeout(timer)
  }, [fadeAnim, slideAnim, scaleAnim])

  // Rotating animation for the decorative elements
  const spinValue = useRef(new Animated.Value(0)).current
  const profileSpinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Start spinning animations
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start()

    Animated.loop(
      Animated.timing(profileSpinValue, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start()
  }, [spinValue, profileSpinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const profileSpin = profileSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const reverseSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  })

  // New function to handle Quiz button click
  const handleQuizButtonClick = () => {
    // Use the passed function to change the active section in HomeScreen
    if (onSectionChange) {
      onSectionChange("Quiz")
    } else {
      // Fallback if navigation prop is available
      navigation.navigate("Quiz")
    }
  }

  if (!isLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Decorative background elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header with Profile Picture */}
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.decorativeLine} />

            {/* Profile Picture and Welcome Text Container */}
            <View style={styles.profileWelcomeContainer}>
              {/* Profile Picture Container */}
              <View style={styles.profileContainer}>
                <Animated.View style={[styles.profileBorder, { transform: [{ rotate: profileSpin }] }]} />
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Feather name="user" size={28} color="#6C47FF" />
                  </View>
                )}
                <View style={styles.statusIndicator} />
              </View>

              {/* Welcome Text */}
              <Text style={styles.welcomeTitle}>
                Bienvenue, <Text style={styles.highlightedText}>{user?.firstName || ""}</Text>
              </Text>
            </View>

            <Text style={styles.welcomeSubtitle}>
              Prêt à améliorer vos connaissances ? Commencez un quiz ou explorez nos ressources d'apprentissage.
            </Text>
            <View style={styles.decorativeLineBottom} />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Animated.View
            style={[
              styles.quickActionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(108, 71, 255, 0.05)", "rgba(217, 70, 239, 0.05)"]}
              style={styles.cardGradient}
            >
              <View style={styles.iconContainer}>
                <Animated.View style={[styles.iconBorder, { transform: [{ rotate: spin }] }]} />
                <FontAwesome6 name="brain" size={28} color="#6C47FF" />
              </View>
              <Text style={styles.cardTitle}>Commencer un Quiz</Text>
              <Text style={styles.cardDescription}>
                Testez vos connaissances avec nos quiz interactifs sur divers sujets.
              </Text>
              <TouchableOpacity style={styles.gradientButton} onPress={handleQuizButtonClick}>
                <LinearGradient
                  colors={["#6C47FF", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonBg}
                >
                  <Text style={styles.buttonText}>Voir les Quiz</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.quickActionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(108, 71, 255, 0.05)", "rgba(217, 70, 239, 0.05)"]}
              style={styles.cardGradient}
            >
              <View style={styles.iconContainer}>
                <Animated.View style={[styles.iconBorder, { transform: [{ rotate: reverseSpin }] }]} />
                <FontAwesome6 name="chart-simple" size={28} color="#6C47FF" />
              </View>
              <Text style={styles.cardTitle}>Mes Statistiques</Text>
              <Text style={styles.cardDescription}>Consultez vos statistiques et les résultats de vos quiz.</Text>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => {
                  if (onSectionChange) {
                    onSectionChange("statistics")
                  } else {
                    navigation.navigate("Stats")
                  }
                }}
              >
                <Text style={styles.outlineButtonText}>Voir votre statistiques</Text>
                <Feather name="arrow-right" size={16} color="#6C47FF" style={styles.buttonIcon} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Featured Content */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="wand-sparkles" size={18} color="#6C47FF" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Quiz populaires</Text>
            <View style={styles.sectionDivider} />
          </View>

          <View style={styles.featuredGrid}>
            {studentFeatured.map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featuredCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity style={styles.featuredCardContent} onPress={handleQuizButtonClick}>
                  <View style={styles.featuredIconContainer}>
                    <FontAwesome6 name={item.iconName} size={18} color="#6C47FF" />
                  </View>
                  <Text style={styles.featuredTitle}>{item.title}</Text>
                  <Text style={styles.featuredDescription}>{item.description}</Text>
                  <View style={styles.featuredFooter}>
                    <View style={styles.tagContainer}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                    <Feather name="arrow-right" size={16} color="#CCCCCC" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

// Featured content for students
const studentFeatured = [
  {
    title: "Les bases de JavaScript",
    description: "Apprenez les fondamentaux de JavaScript avec ce quiz interactif.",
    tag: "Débutant",
    iconName: "bolt-lightning",
  },
  {
    title: "CSS Avancé",
    description: "Testez vos connaissances sur les fonctionnalités avancées de CSS.",
    tag: "Intermédiaire",
    iconName: "brain",
  },
  {
    title: "React Hooks",
    description: "Maîtrisez les hooks de React avec ce quiz complet.",
    tag: "Avancé",
    iconName: "book-open",
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  decorativeCircle1: {
    position: "absolute",
    top: 24,
    right: 10,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(108, 71, 255, 0.1)",
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: "#6C47FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 40,
    left: 10,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(217, 70, 239, 0.1)",
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: "#D946EF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 60,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeHeader: {
    alignItems: "center",
    position: "relative",
    paddingVertical: 20,
  },
  decorativeLine: {
    width: 80,
    height: 3,
    backgroundColor: "#6C47FF",
    borderRadius: 2,
    marginBottom: 20,
    opacity: 0.7,
  },
  decorativeLineBottom: {
    width: 40,
    height: 3,
    backgroundColor: "#6C47FF",
    borderRadius: 2,
    marginTop: 20,
    opacity: 0.7,
  },
  profileWelcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  profileContainer: {
    width: 70,
    height: 70,
    marginRight: 16,
    position: "relative",
  },
  profileBorder: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(108, 71, 255, 0.3)",
    borderStyle: "dashed",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#6C47FF",
    marginTop: 3,
    marginLeft: 3,
  },
  profilePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(108, 71, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C47FF",
    marginTop: 3,
    marginLeft: 3,
  },
  statusIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50", // Green for online status
    borderWidth: 2,
    borderColor: "#FFFFFF",
    bottom: 3,
    right: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  highlightedText: {
    color: "#6C47FF",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  quickActionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(108, 71, 255, 0.1)",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(108, 71, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  iconBorder: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(108, 71, 255, 0.3)",
    borderStyle: "dashed",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 20,
  },
  gradientButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButtonBg: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  outlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 71, 255, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108, 71, 255, 0.05)",
  },
  outlineButtonText: {
    color: "#6C47FF",
    fontWeight: "600",
    fontSize: 16,
  },
  featuredSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIcon: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  sectionDivider: {
    width: 60,
    height: 3,
    backgroundColor: "#6C47FF",
    borderRadius: 2,
  },
  featuredGrid: {
    flexDirection: "column",
  },
  featuredCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featuredCardContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  featuredIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(108, 71, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  featuredDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(108, 71, 255, 0.1)",
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#6C47FF",
    fontWeight: "500",
  },
})

export default AccueilScreen
