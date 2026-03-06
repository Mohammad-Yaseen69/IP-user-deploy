import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import notification_sound from "./audio/notification.wav"

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

    connectToServer(userId, transactionConnection = false, transactionId, token) {
        this.socket.on('connect', () => {
            console.log('Connected to the server');
            if (transactionConnection) {
                this.socket.emit("subscribeTransaction", { transactionId, token })
            } else {
                this.socket.emit('setUserId', userId);
            }
            this.socket.emit('messageFromFrontend', 'Hello from the client!');
        });

        this.socket.on('messageFromBackend', (data) => {
            console.log('Received data from server:', data);
        });

        this.socket.on('privateMessage', (data) => {
            console.log('Received data from server:', data);
            this.checkAuth("from sockets.")
            document.title = data;
            toast.success(data);
            const sound = new Audio(notification_sound)
            sound.play()
            setTimeout(() => {
                document.title = "InstaPay"
            }, 5000);
        });


        this.socket.on("txn:update", (data) => {
            const status = data.status // COMPLETED, PROCESSING, FAILED
            console.log("txn:update", data);
        })

        this.socket.on("txn:subscribed", (data) => {
            console.log("txn:subscribed", data)
        })

        this.socket.on("txn:subscribeError", (data) => {
            console.log("txn:subscribeError", data)
        })
    }

    disconnect() {
        this.socket.disconnect();
    }

    sendTransaction(data) {
        this.socket.emit('transaction', data);
    }

    onTransactionNotification() {
        return this.socket.fromEvent('transactionNotification');
    }
}

export default SocketsService;