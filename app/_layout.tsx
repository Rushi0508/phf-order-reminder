import { useEffect } from "react";
import { Stack } from "expo-router";
import { AppProvider } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      if (!username && segments[0] !== "name") {
        router.replace("/name");
      }
    } catch (error) {
      console.error("Error checking first time:", error);
    }
  };

  return (
    <Stack>
      <Stack.Screen
        name="name"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <InitialLayout />
    </AppProvider>
  );
}
