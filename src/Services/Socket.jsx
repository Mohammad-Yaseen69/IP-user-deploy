import { toast } from "react-toastify";
import { io } from "socket.io-client";
import notification_sound from "./audio/notification.wav";
import { clearAuthStorage, getLoginPath } from "../utils/Functions/loginPage";

class SocketsService {
  constructor(config, checkAuth) {
    this.socket = io(config.url, {
      transports: ["websocket"],
      autoConnect: false,
    });
    this.checkAuth = checkAuth.bind(this);
  }

  connect() {
    this.socket.connect();
  }

  connectToServer(
    userId,
    transactionConnection = false,
    transactionId,
    token,
    onAnotherLogin,
  ) {
    this.socket.on("connect", () => {
      console.log("Connected to the server");
      if (transactionConnection) {
        this.socket.emit("subscribeTransaction", { transactionId, token });
      } else {
        this.socket.emit("setUserId", userId);
      }
      this.socket.emit("messageFromFrontend", "Hello from the client!");
    });

    this.socket.on("messageFromBackend", (data) => {
      console.log("Received data from server:", data);
    });

    this.socket.on("privateMessage", (data) => {
      console.log("Received data from server:", data);
      this.checkAuth("from sockets.");
      document.title = data;
      toast.success(data);
      const sound = new Audio(notification_sound);
      sound.play();
      setTimeout(() => {
        document.title = "InstaPay";
      }, 5000);

      if (this.onPrivateMessage) {
        this.onPrivateMessage(data);
      }
    });

    this.socket.on("new_notification", (data) => {
      try {
        const sound = new Audio(notification_sound);
        sound.play().catch(() => {});
      } catch (e) {}

      if ((data?.title || data?.desc) && data?.type !== "virtual_iban") {
        toast.info(data.title || data.desc);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("instapay:new_notification", { detail: data }),
        );
      }

      if (this.onNewNotification) {
        this.onNewNotification(data);
      }
    });

    this.socket.on("txn:update", (data) => {
      const status = data.status;
      console.log("txn:update", data);
    });

    this.socket.on("anotherLogin", (data) => {
      const token = localStorage.getItem("token");

      console.log("anotherLogin called", data, token);
      if (onAnotherLogin) {
        onAnotherLogin();
      } else {
        clearAuthStorage();
        window.location.pathname = getLoginPath();
      }
    });

    this.socket.on("txn:subscribed", (data) => {
      console.log("txn:subscribed", data);
    });

    this.socket.on("txn:subscribeError", (data) => {
      console.log("txn:subscribeError", data);
    });

    this.socket.on("crypto_wallet:created", (data) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("instapay:crypto_wallet:created", { detail: data }),
        );
      }
    });

    this.socket.on("crypto_wallet:deposit_detected", (data) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("instapay:crypto_wallet:deposit_detected", {
            detail: data,
          }),
        );
      }
      toast.info(
        `Incoming ${data?.currency || ""} deposit detected — awaiting confirmation.`,
      );
    });

    this.socket.on("crypto_wallet:deposit_completed", (data) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("instapay:crypto_wallet:deposit_completed", {
            detail: data,
          }),
        );
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  sendTransaction(data) {
    this.socket.emit("transaction", data);
  }

  onTransactionNotification() {
    return this.socket.fromEvent("transactionNotification");
  }
}

export default SocketsService;
