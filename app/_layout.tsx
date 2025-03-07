import { useEffect } from "react";
import { Stack } from "expo-router";
import { AppProvider } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from "@expo-google-fonts/urbanist";
import { Text } from "react-native";

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <AppProvider>
      <InitialLayout />
    </AppProvider>
  );
}

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

export default RootLayout;
