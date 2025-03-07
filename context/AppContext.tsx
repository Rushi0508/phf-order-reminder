import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, handleApiError } from "../utils/api";
import { Alert } from "react-native";

interface Todo {
  _id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  completed: boolean;
  date: string;
}

interface AppContextType {
  username: string | null;
  setUsername: (name: string) => void;
  todos: Todo[];
  addTodo: (text: string) => Promise<void>;
  deadline: string;
  setDeadline: (time: string) => void;
  isAfterDeadline: () => boolean;
  toggleTodoComplete: (todoId: string) => Promise<void>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  deleteTodo: (todoId: string) => Promise<void>;
  updateTodo: (todoId: string, text: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
  isFetching: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deadline, setDeadlineState] = useState<string>("18:00"); // Default deadline 6 PM
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    refreshTodos();
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const { deadline: storedDeadline } = await api.metadata.getDeadline();

      if (storedUsername) setUsernameState(storedUsername);
      if (storedDeadline) {
        setDeadlineState(storedDeadline);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load saved data");
    }
  };

  const refreshTodos = async () => {
    try {
      setIsFetching(true);
      const data = await api.todos.list(selectedDate);
      setTodos(data);
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to fetch todos");
    } finally {
      setIsFetching(false);
    }
  };

  const setUsername = async (name: string) => {
    try {
      await AsyncStorage.setItem("username", name);
      setUsernameState(name);
    } catch (error) {
      console.error("Error saving username:", error);
      Alert.alert("Error", "Failed to save username");
    }
  };

  const setDeadline = async (time: string) => {
    try {
      await api.metadata.setDeadline(time);
      setDeadlineState(time);
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to save deadline");
    }
  };

  const isAfterDeadline = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (selectedDate > today) return false;
    if (selectedDate < today) return true;

    const [hours, minutes] = deadline.split(":").map(Number);
    const deadlineTime = new Date(now);
    deadlineTime.setHours(hours, minutes, 0);
    return now > deadlineTime;
  };

  const addTodo = async (text: string) => {
    try {
      const targetDate =
        isAfterDeadline() && selectedDate === new Date().toISOString().split("T")[0]
          ? new Date(Date.now() + 86400000).toISOString().split("T")[0] // next day
          : selectedDate;

      await api.todos.create({
        text,
        createdBy: username || "Anonymous",
        date: targetDate,
      });
      await refreshTodos();
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to add todo");
    }
  };

  const toggleTodoComplete = async (todoId: string) => {
    try {
      const todo = todos.find((t) => t._id === todoId);
      if (!todo) return;

      await api.todos.update(todoId, {
        ...todo,
        completed: !todo.completed,
      });
      await refreshTodos();
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const updateTodo = async (todoId: string, text: string) => {
    try {
      const todo = todos.find((t) => t._id === todoId);
      if (!todo) return;

      await api.todos.update(todoId, {
        ...todo,
        text,
      });
      await refreshTodos();
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await api.todos.delete(todoId);
      await refreshTodos();
    } catch (error) {
      handleApiError(error);
      Alert.alert("Error", "Failed to delete todo");
    }
  };

  const value = {
    username,
    setUsername,
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
    refreshTodos,
    isFetching,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
