const vscode = require("vscode");
const { REMINDER_TIME, SCHEDULED_DAYS } = require("./constants");

function getScheduleTime(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + SCHEDULED_DAYS,
    12,
    0,
    0,
    0
  );
}

function checkAndShowWeeklyNotification(context) {
  const now = new Date();

  const scheduledTime = context.globalState.get(REMINDER_TIME);
  if (scheduledTime && now.getTime() >= new Date(scheduledTime).getTime()) {
    vscode.window.showInformationMessage(
      "📝 devtrackr Reminder: Time to document your weekly work!"
    );

    const newScheduledTime = getScheduleTime(new Date(scheduledTime));
    const formattedTime = newScheduledTime.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    showStatusMessage(
      `$(clock) Reminder is set. we will remind you at ${formattedTime}`,
      1000
    );
    return context.globalState.update(REMINDER_TIME, newScheduledTime);
  }

  if (!scheduledTime) {
    const newScheduledTime = getScheduleTime(now);
    const formattedTime = newScheduledTime.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    showStatusMessage(
      `$(clock) Reminder is set. we will remind you at ${formattedTime}`,
      1000
    );
    return context.globalState.update(REMINDER_TIME, newScheduledTime);
  }
}

function showStatusMessage(message, timeout = 0) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.text = message;
  statusBarItem.show();

  if (timeout) {
    setTimeout(() => {
      statusBarItem.dispose();
    }, timeout);
  }

  return statusBarItem;
}

module.exports = {
  getScheduleTime,
  checkAndShowWeeklyNotification,
  showStatusMessage,
};
