"use client"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, BackHandler } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { clearSession } from "../utils/session"
import { useAuth } from "@clerk/clerk-expo"
import { useEffect, useCallback } from "react"

const ProfesseurHomeScreen = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigation = useNavigation()
  
  // Prevent going back to sign-in screen after logging in
  useFocusEffect(
    useCallback(() => {
      // Disable the back button when this screen is focused
      const onBackPress = () => {
        return true; // Return true to prevent default behavior (going back)
      };
      
      // Add event listener for hardware back button press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Cleanup function to remove the event listener when the component unmounts
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  // Set navigation options to hide back button in header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // This removes the back button from header
      gestureEnabled: false,  // This disables swipe-back gesture on iOS
    });
  }, [navigation]);

  const handleSignOut = async () => {
    try {
      // Add a small delay to ensure proper cleanup
      await clearSession(signOut);
      
      // Reset navigation stack completely to prevent back navigation
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }]
      });
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient colors={["#f7f9ff", "#ffffff"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <LinearGradient
              colors={["#7C5AFF", "#6C47FF"]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="account" size={24} color="#FFFFFF" />
            </LinearGradient>

            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Hi, Professeur</Text>
              <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.message}>
            Welcome to your professor dashboard. This is where you'll manage your courses and students.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  signOutButton: {
    backgroundColor: "#6C47FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default ProfesseurHomeScreen