import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { Fonts } from "../constants/Fonts";

export default function NameScreen() {
  const [name, setName] = useState("");
  const { username, setUsername } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (username) {
      router.replace("/(tabs)");
    }
  }, [username]);

  const handleSubmit = () => {
    if (name.trim()) {
      setUsername(name.trim());
      router.replace("/(tabs)");
    } else {
      alert("Please enter your name");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Todo App!</Text>
      <Text style={styles.subtitle}>Please enter your name to continue</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoFocus
        onSubmitEditing={handleSubmit}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontFamily: Fonts.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
