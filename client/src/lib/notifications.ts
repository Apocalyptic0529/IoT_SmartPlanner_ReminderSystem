import { Task } from "@shared/schema";

declare global {
  interface Window {
    currentTasks: Task[];
    startTaskNotifications: (queryClient?: any) => void;
    notifiedTaskIds: Set<number>;
  }
}

let taskInterval: number | null = null;
let refreshInterval: number | null = null;

if (!window.notifiedTaskIds) {
  window.notifiedTaskIds = new Set();
}

function playNotificationSound(isAlarm: boolean = false) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (isAlarm) {
      // Alarm sound: higher pitch, longer duration, multiple beeps
      oscillator.frequency.value = 1000;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    } else {
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (e) {
    console.debug('Audio notification not available');
  }
}

function showNotification(title: string, body: string, isAlarm: boolean = false) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      (registration as any).showNotification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: `task-alert-${Date.now()}`,
        renotify: true,
        vibrate: isAlarm ? [200, 100, 200, 100, 200] : [100]
      });
      playNotificationSound(isAlarm);
    });
  }
}

function checkTasksAndNotify(queryClient?: any) {
  if (!window.currentTasks || !window.currentTasks.length) return;

  const now = new Date();

  window.currentTasks.forEach(task => {
    if (task.status !== 'pending') return;

    const dueDate = new Date(task.dueDateTime);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / (1000 * 60));

    // Handle 10s alarm
    if (diffSeconds >= 0 && diffSeconds <= 10) {
      const alarmKey = `alarm-${task.id}`;
      if (!window.notifiedTaskIds.has(alarmKey as any)) {
        (window.notifiedTaskIds as any).add(alarmKey);
        showNotification(`🚨 ALARM: ${task.title}`, 'TASK DUE IN 10 SECONDS!', true);
      }
    }

    // Handle 30s interval notifications starting 2 mins before
    if (diffSeconds >= -5 && diffSeconds <= 120) {
      const intervalKey = Math.floor(diffSeconds / 30);
      const trackingKey = `${task.id}-${intervalKey}`;
      if (!window.notifiedTaskIds.has(trackingKey)) {
        (window.notifiedTaskIds as any).add(trackingKey);
        
        if (diffSeconds <= 5 && diffSeconds >= -5) {
          showNotification(`🔔 ${task.title}`, 'Due now!');
        } else {
          showNotification(`Reminder: ${task.title}`, `Due in ${diffMins > 0 ? diffMins + ' minutes' : 'less than a minute'}`);
        }
      }
    }
  });
}

window.startTaskNotifications = (queryClient?: any) => {
  if (taskInterval) window.clearInterval(taskInterval);
  if (refreshInterval) window.clearInterval(refreshInterval);

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Check tasks every 10 seconds for alarm and notifications
  taskInterval = window.setInterval(() => checkTasksAndNotify(queryClient), 10000);
  
  // Refresh data every 60 seconds to get latest tasks
  if (queryClient) {
    refreshInterval = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }, 60000);
  }
  
  checkTasksAndNotify(queryClient);
};
