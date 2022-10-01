import {
  faCircleInfo,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transition } from "@headlessui/react";
import { useNotifications } from "../../stores/notifications";

export default function Notifications() {
  const notifications = useNotifications((state) => state.notifications);
  const dismiss = useNotifications((state) => state.dismiss);
  return (
    <div className="fixed right-4 bottom-4">
      {notifications.map((notification) => (
        <Transition
          key={notification.id}
          appear={true}
          show={notification.isShown}
          enter="transition-all ease-out duration-300"
          enterFrom="transform sm:opacity-0 sm:translate-x-[100%] translate-y-[100%] sm:translate-y-0"
          enterTo="transform opacity-100 translate-x-0 translate-y-0"
          leave="transition-all ease-in duration-300"
          leaveTo="transform sm:opacity-0 sm:translate-x-[100%] translate-y-[100%] sm:translate-y-0"
          leaveFrom="transform opacity-100 translate-x-0 translate-y-0"
        >
          <div
            onClick={() => dismiss(notification.id)}
            key={notification.id}
            className={`md:text-md my-1 flex items-center rounded-md p-3 text-xs text-white shadow-lg ${
              notification.isError ? "bg-[#793D3D]" : "bg-tan-400"
            }`}
          >
            {notification.isError ? (
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            ) : (
              <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
            )}
            <div className="flex gap-3 truncate">{notification.message}</div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
