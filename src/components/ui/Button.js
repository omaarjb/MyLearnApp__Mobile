import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native"

const Button = ({ title, loading = false, variant = "primary", style, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.button, variant === "secondary" ? styles.secondaryButton : styles.primaryButton, style]}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#6C47FF"} />
      ) : (
        <Text style={[styles.text, variant === "secondary" ? styles.secondaryText : styles.primaryText]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#6C47FF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6C47FF",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#6C47FF",
  },
})

export default Button
