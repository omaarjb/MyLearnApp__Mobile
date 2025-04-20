import { TouchableOpacity, Text, StyleSheet, Image } from "react-native"

const OAuthButton = ({ provider, ...props }) => {
  const getProviderDetails = () => {
    switch (provider) {
      case "google":
        return {
          icon: "/placeholder.svg?height=24&width=24",
          text: "Continue with Google",
        }
      case "apple":
        return {
          icon: "/placeholder.svg?height=24&width=24",
          text: "Continue with Apple",
        }
      case "facebook":
        return {
          icon: "/placeholder.svg?height=24&width=24",
          text: "Continue with Facebook",
        }
      default:
        return {
          icon: "/placeholder.svg?height=24&width=24",
          text: "Continue with OAuth",
        }
    }
  }

  const { icon, text } = getProviderDetails()

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Image source={{ uri: icon }} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
  },
})

export default OAuthButton
