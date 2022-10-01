import Button from "../../components/input/Button";
import { useNotifications } from "../../stores/notifications";

export default function NotificationsTest() {
  const sendNotification = useNotifications((state) => state.sendNotification);
  return (
    <div>
      <Button onClick={() => sendNotification("Failed to fetch battles")}>
        Send
      </Button>
    </div>
  );
}
