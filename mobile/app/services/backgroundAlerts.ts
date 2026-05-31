import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { getAccessToken } from "./auth";
import { apiBaseUrl } from "./config";

const ALERT_EVALUATION_TASK = "signalkite-alert-evaluation";

TaskManager.defineTask(ALERT_EVALUATION_TASK, async () => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${apiBaseUrl()}/wealth/alerts/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return response.ok ? BackgroundTask.BackgroundTaskResult.Success : BackgroundTask.BackgroundTaskResult.Failed;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerAlertBackgroundTask() {
  if (Platform.OS === "web") {
    return;
  }

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    return;
  }

  const registered = await TaskManager.isTaskRegisteredAsync(ALERT_EVALUATION_TASK);
  if (!registered) {
    await BackgroundTask.registerTaskAsync(ALERT_EVALUATION_TASK, {
      minimumInterval: 15
    });
  }
}
