import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarStyle: {
          display: "none", // Hide the tab bar since we only have one tab
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          color: "#000",
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
