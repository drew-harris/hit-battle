import create from "zustand";

interface Notification {
  id: string;
  message: string;
  isError: boolean;
  isShown: boolean;
  hideDelay: number;
}

type InputNoticication = Omit<Notification, "id" | "isShown">;

interface NotificationsState {
  notifications: Notification[];
  sendFullNotification: (notification: InputNoticication) => void;
  sendNotification: (message: string, isError?: boolean) => void;
  sendError: (message: string) => void;

  dismiss: (id: string) => void;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  sendFullNotification(notification) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      isShown: true,
    };
    set({ notifications: [...get().notifications, newNotification] });
    setTimeout(() => {
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? { ...n, isShown: false } : n
        ),
      });
    }, notification.hideDelay);
  },

  sendNotification(message, isError = false) {
    get().sendFullNotification({
      message,
      isError,
      hideDelay: 2000,
    });
  },

  sendError(message) {
    get().sendNotification(message, true);
  },

  dismiss(id) {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, isShown: false } : n
      ),
    });
  },
}));
