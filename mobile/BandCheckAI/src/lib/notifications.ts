/**
 * Push notification scheduling for BandCheck AI appeal stages.
 * Uses local scheduled notifications only — no push server required.
 * Respects a non-spammy schedule: max 4 notifications per appeal case.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Cancel all notifications tied to a specific appeal postcode
export async function cancelAppealNotifications(postcode: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (n) => n.content.data?.postcode === postcode,
  );
  await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

type ScheduleOptions = {
  postcode: string;
  formattedPostcode: string;
};

/**
 * Schedule notifications after appeal is started but NOT yet submitted.
 * Fires at: 3 days, 7 days.
 */
export async function schedulePackReminderNotifications({ postcode, formattedPostcode }: ScheduleOptions): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await cancelAppealNotifications(postcode);

  const now = Date.now();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your evidence pack is ready",
      body: `Have you submitted your council tax appeal for ${formattedPostcode} yet?`,
      data: { postcode, stage: "pack_reminder_3d" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(now + 3 * 24 * 60 * 60 * 1000) },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't miss your window",
      body: `Your appeal pack for ${formattedPostcode} is waiting. Submitting takes under 5 minutes.`,
      data: { postcode, stage: "pack_reminder_7d" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(now + 7 * 24 * 60 * 60 * 1000) },
  });
}

/**
 * Schedule notifications after appeal has been submitted.
 * Fires at: 14 days (check-in), 35 days (outcome follow-up).
 */
export async function schedulePostSubmissionNotifications({ postcode, formattedPostcode }: ScheduleOptions): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await cancelAppealNotifications(postcode);

  const now = Date.now();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Any update from the VOA?",
      body: `It's been two weeks since you submitted your ${formattedPostcode} appeal. Log any updates in the app.`,
      data: { postcode, stage: "submission_checkin_14d" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(now + 14 * 24 * 60 * 60 * 1000) },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Did your appeal succeed?",
      body: `Let us know the outcome for ${formattedPostcode}. It only takes a moment.`,
      data: { postcode, stage: "outcome_followup_35d" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(now + 35 * 24 * 60 * 60 * 1000) },
  });
}

/**
 * Cancel all notifications for a postcode once the outcome is recorded.
 */
export async function cancelAllNotificationsForCase(postcode: string): Promise<void> {
  await cancelAppealNotifications(postcode);
}
