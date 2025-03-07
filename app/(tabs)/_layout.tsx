import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Fonts } from "@/constants/Fonts";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarStyle: {
          display: "none",
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          color: "#000",
          fontFamily: Fonts.bold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "PHF <> Opengig Todo",
          headerTitle: "PHF <> Opengig",
        }}
      />
    </Tabs>
  );
}
