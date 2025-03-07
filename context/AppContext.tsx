import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setupNotifications, scheduleDeadlineReminder } from "../utils/notifications";

interface Todo {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
}

interface AppContextType {
  username: string | null;
  setUsername: (name: string) => void;
  todos: Todo[];
  addTodo: (text: string) => void;
  deadline: string;
  setDeadline: (time: string) => void;
  isAfterDeadline: () => boolean;
  toggleTodoComplete: (todoId: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getTodosByDate: (date: string) => Todo[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [deadline, setDeadlineState] = useState<string>("18:00");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    // Load username and todos from storage on app start
    loadInitialData();
    // Set up notifications
    setupNotifications();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const storedTodos = await AsyncStorage.getItem("todos");
      const storedDeadline = await AsyncStorage.getItem("deadline");

      if (storedUsername) setUsernameState(storedUsername);
      if (storedTodos) setTodos(JSON.parse(storedTodos));
      if (storedDeadline) {
        setDeadlineState(storedDeadline);
        // Schedule reminder for the stored deadline
        await scheduleDeadlineReminder(storedDeadline);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const setUsername = async (name: string) => {
    try {
      await AsyncStorage.setItem("username", name);
      setUsernameState(name);
    } catch (error) {
      console.error("Error saving username:", error);
    }
  };

  const setDeadline = async (time: string) => {
    try {
      await AsyncStorage.setItem("deadline", time);
      setDeadlineState(time);
      await scheduleDeadlineReminder(time);
    } catch (error) {
      console.error("Error saving deadline:", error);
    }
  };

  const isAfterDeadline = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (selectedDate > today) return false;
    if (selectedDate < today) return true;

    // For today, check the time
    const [hours, minutes] = deadline.split(":").map(Number);
    const deadlineTime = new Date(now);
    deadlineTime.setHours(hours, minutes, 0);
    return now > deadlineTime;
  };

  const addTodo = async (text: string) => {
    try {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        createdBy: username || "Anonymous",
        createdAt: new Date().toISOString(),
        completed: false,
        date:
          isAfterDeadline() && selectedDate === new Date().toISOString().split("T")[0]
            ? new Date(Date.now() + 86400000).toISOString().split("T")[0] // next day if current date and after deadline
            : selectedDate, // selected date
      };

      const updatedTodos = [...todos, newTodo];
      await AsyncStorage.setItem("todos", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodoComplete = async (todoId: string) => {
    try {
      const updatedTodos = todos.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo));
      await AsyncStorage.setItem("todos", JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const getTodosByDate = (date: string) => {
    return todos.filter((todo) => todo.date === date);
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
    getTodosByDate,
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
