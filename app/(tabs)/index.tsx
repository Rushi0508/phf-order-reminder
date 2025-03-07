import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Pressable } from "react-native";
import { useApp } from "../../context/AppContext";
import { FontAwesome } from "@expo/vector-icons";

export default function TodoScreen() {
  const {
    username,
    todos,
    addTodo,
    deadline,
    setDeadline,
    isAfterDeadline,
    toggleTodoComplete,
    selectedDate,
    setSelectedDate,
    getTodosByDate,
  } = useApp();

  const [newTodo, setNewTodo] = useState("");
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(deadline);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const today = new Date().toISOString().split("T")[0];
      if (isAfterDeadline() && selectedDate === today) {
        alert("Deadline passed! This todo will be added for tomorrow.");
      }
      addTodo(newTodo.trim());
      setNewTodo("");
    }
  };

  const handleDeadlineSubmit = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(tempDeadline)) {
      setDeadline(tempDeadline);
      setIsEditingDeadline(false);
    } else {
      alert("Please enter a valid time in HH:mm format");
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {username}!</Text>
        <View style={styles.deadlineContainer}>
          <Text style={styles.deadlineLabel}>Today's Deadline: </Text>
          {isEditingDeadline ? (
            <View style={styles.deadlineInputContainer}>
              <TextInput
                style={styles.deadlineInput}
                value={tempDeadline}
                onChangeText={setTempDeadline}
                placeholder="HH:mm"
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity onPress={handleDeadlineSubmit} style={styles.deadlineButton}>
                <Text style={styles.buttonText}>Set</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingDeadline(true)}>
              <Text style={styles.deadlineTime}>{deadline}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
            <FontAwesome name="chevron-left" size={16} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
            <FontAwesome name="chevron-right" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Add a new todo..."
          onSubmitEditing={handleAddTodo}
        />
        <TouchableOpacity onPress={handleAddTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getTodosByDate(selectedDate)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTodoComplete(item.id)} style={styles.todoItem}>
            <View style={styles.todoLeft}>
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <FontAwesome name="check" size={12} color="#fff" />}
              </View>
              <View>
                <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>{item.text}</Text>
                <Text style={styles.todoMeta}>
                  Added by {item.createdBy} at {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  deadlineLabel: {
    fontSize: 16,
  },
  deadlineTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  deadlineInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    width: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  deadlineButton: {
    padding: 8,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todoItem: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  todoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  todoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  todoMeta: {
    fontSize: 12,
    color: "#666",
  },
});
