import { View, Text, TextInput, StyleSheet } from "react-native"

const Input = ({ label, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#A0A0A0" {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
})

export default Input
