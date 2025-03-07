import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Only play sound for actual reminders, not scheduling notifications
    const isReminderNotification = notification.request.content.data?.type === "reminder";

    return {
      shouldShowAlert: isReminderNotification,
      shouldPlaySound: isReminderNotification,
      shouldSetBadge: false,
    };
  },
});

export const setupNotifications = async () => {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Please enable notifications to receive deadline reminders!");
      return false;
    }

    // On Android, we need to set notification channel for background notifications
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return true;
  } catch (error) {
    console.error("Error setting up notifications:", error);
    return false;
  }
};

export const scheduleDeadlineReminder = async (deadline: string) => {
  try {
    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Parse deadline time
    const [hours, minutes] = deadline.split(":").map(Number);

    // Calculate reminder time (15 minutes before deadline)
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes - 15, 0, 0); // 15 minutes before deadline

    // If reminder time is in the past today, start from tomorrow
    const now = new Date();
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    // Schedule a daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ PHF <> Opengig Order Deadline",
        body: `Today's todo deadline (${deadline}) is in 15 minutes!`,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: "reminder" }, // Mark this as a reminder notification
      },
      trigger: {
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
        repeats: true,
      } as any,
    });

    // Show a silent notification to confirm the schedule change
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Deadline Updated",
        body: `Daily reminder set for ${reminderTime.toLocaleTimeString()}`,
        data: { type: "confirmation" }, // Mark this as a confirmation notification
      },
      trigger: null, // Show immediately but silently
    });

    console.log("Daily reminder scheduled for", reminderTime.toLocaleTimeString());
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
};
