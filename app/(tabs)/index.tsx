import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { format, formatDistanceToNow } from "date-fns";
import { Fonts } from "../../constants/Fonts";

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
    deleteTodo,
    updateTodo,
  } = useApp();

  const [newTodo, setNewTodo] = useState("");
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(deadline);
  const [editingTodo, setEditingTodo] = useState<{ _id: string; text: string } | null>(null);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const today = new Date().toISOString().split("T")[0];
      if (isAfterDeadline() && selectedDate === today) {
        Alert.alert("Deadline passed!", "This todo will be added for tomorrow.");
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
      Alert.alert("Invalid Time", "Please enter a valid time in HH:mm format");
    }
  };

  const handleEditTodo = (todo: { _id: string; text: string }) => {
    setEditingTodo(todo);
  };

  const handleUpdateTodo = () => {
    if (editingTodo && editingTodo.text.trim()) {
      updateTodo(editingTodo._id, editingTodo.text);
      setEditingTodo(null);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTodo(todoId) },
    ]);
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEE, MMM d");
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
              <Text style={styles.deadlineTime}>{format(new Date(`2025-03-07T${deadline}:00`), "hh:mm a")}</Text>
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
        data={todos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTodoComplete(item._id)} style={styles.todoItem}>
            <View style={styles.todoLeft}>
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <FontAwesome name="check" size={12} color="#fff" />}
              </View>
              <View style={styles.todoContent}>
                {editingTodo?._id === item._id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editingTodo?.text}
                      onChangeText={(text) => setEditingTodo({ ...editingTodo, text })}
                      autoFocus
                      onSubmitEditing={handleUpdateTodo}
                    />
                    <TouchableOpacity onPress={handleUpdateTodo} style={styles.editButton}>
                      <Text style={styles.editButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>{item.text}</Text>
                    <Text style={styles.todoMeta}>
                      <Text style={styles.todoMetaBold}>
                        {item?.createdBy} • {formatTime(item.createdAt)}
                      </Text>
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={styles.todoActions}>
              <TouchableOpacity onPress={() => handleEditTodo(item)} style={styles.actionButton}>
                <FontAwesome name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTodo(item._id)} style={styles.actionButton}>
                <FontAwesome name="trash" size={16} color="#FF3B30" />
              </TouchableOpacity>
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
  todoMetaBold: {
    fontFamily: Fonts.semiBold,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    marginBottom: 10,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  deadlineLabel: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  deadlineTime: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
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
    fontFamily: Fonts.regular,
  },
  deadlineButton: {
    padding: 8,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.regular,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontFamily: Fonts.semiBold,
  },
  todoItem: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: Fonts.regular,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  todoMeta: {
    fontSize: 12,
    color: "#666",
    fontFamily: Fonts.regular,
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  editContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginRight: 10,
    borderRadius: 5,
    fontFamily: Fonts.regular,
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontFamily: Fonts.medium,
  },
});
