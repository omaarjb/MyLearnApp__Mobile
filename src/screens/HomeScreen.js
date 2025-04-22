
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useNavigation } from "@react-navigation/native"
import { clearSession } from "../utils/session"

const HomeScreen = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigation = useNavigation()

  const handleSignOut = async () => {
    try {
      await clearSession(signOut); // Pass signOut as parameter
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }]
      });
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>{user?.firstName || "User"}</Text>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{
            uri: user?.imageUrl || "/placeholder.svg?height=100&width=100",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user?.fullName || "User"}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress || "No email"}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID:</Text>
          <Text style={styles.infoValue}>{user?.id || "Unknown"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
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
  profileCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666666",
  },
  infoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666666",
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "#6C47FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default HomeScreen
