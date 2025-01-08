import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import notification_sound from "./audio/notification.wav"

class SocketsService {
    constructor(config, checkAuth) {
        this.socket = io(config.url, config.options);
        this.checkAuth = checkAuth.bind(this);
    }

    connect() {
        this.socket.connect();
    }

    connectToServer(userId) {
        this.socket.on('connect', () => {
            console.log('Connected to the server');
            this.socket.emit('setUserId', userId);
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

        this.socket.emit('messageFromFrontend', 'Hello from the client!');
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