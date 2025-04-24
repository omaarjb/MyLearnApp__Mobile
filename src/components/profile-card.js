"use client"

import { View, Text, StyleSheet, Image, Animated, Dimensions } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { useRef, useEffect } from "react"
import { Feather } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export const ProfileCard = () => {
  const { user } = useUser()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  // Get role from unsafe metadata if available
  const userRole = user?.unsafeMetadata?.role || "User"

  // Format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.backgroundGradient}>
        {/* Centered profile image, name and role inside the gradient background */}
        <View style={styles.centeredProfileHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: user?.imageUrl || "https://via.placeholder.com/100",
              }}
              style={styles.profileImage}
            />
          </View>

          <Text style={styles.name}>{user?.fullName || "User"}</Text>

          <View style={styles.roleBadge}>
            <Feather name="award" size={14} color="#6C47FF" style={styles.roleIcon} />
            <Text style={styles.roleText}>{userRole}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="user" size={18} color="#6C47FF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>{user?.firstName || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="users" size={18} color="#6C47FF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>{user?.lastName || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="mail" size={18} color="#6C47FF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.primaryEmailAddress?.emailAddress || "No email"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="calendar" size={18} color="#6C47FF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
          </View>
        </View>

        {/* <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Feather name="hash" size={18} color="#6C47FF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>{user?.id || "Unknown"}</Text>
          </View>
        </View> */}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#6C47FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  backgroundGradient: {
    position: "relative",
    height: 200,
    backgroundColor: "#F5F3FF",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  centeredProfileHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EBFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  roleIcon: {
    marginRight: 6,
  },
  roleText: {
    fontSize: 14,
    color: "#6C47FF",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 24,
    marginVertical: 20,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
})
