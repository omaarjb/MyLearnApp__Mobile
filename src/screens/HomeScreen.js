"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler, Animated, Dimensions } from "react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { clearSession } from "../utils/session"
import { useEffect, useCallback, useState, useRef } from "react"
import { Feather } from "@expo/vector-icons"
import { ProfileCard } from "../components/profile-card"

const { width } = Dimensions.get("window")
const SIDEBAR_WIDTH = 250

const HomeScreen = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigation = useNavigation()
  const [activeSection, setActiveSection] = useState("profile")
  const [sidebarVisible, setSidebarVisible] = useState(false)

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

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>My Profile</Text>
            <ProfileCard />
          </View>
        )
      case "statistics":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Statistics</Text>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>42</Text>
                <Text style={styles.statLabel}>Total Visits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Active Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
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
            style={[styles.sidebarMenuItem, activeSection === "profile" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("profile")}
          >
            <Feather name="user" size={20} color={activeSection === "profile" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "profile" && styles.activeMenuText]}>
              My Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarMenuItem, activeSection === "statistics" && styles.activeMenuItem]}
            onPress={() => handleMenuItemPress("statistics")}
          >
            <Feather name="bar-chart-2" size={20} color={activeSection === "statistics" ? "#6C47FF" : "#666666"} />
            <Text style={[styles.sidebarMenuText, activeSection === "statistics" && styles.activeMenuText]}>
              Statistics
            </Text>
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
})

export default HomeScreen
