import io from "socket.io-client";

class SocketEvents {
  constructor() {
    const host = process.env.SOCKET_URL;

    if (!host) {
      throw new Error("SOCKET_URL is not defined");
    }

    // Инициализируем соединение
    this.socket = io(host, {
      transports: ['websocket'],
      upgrade: false,
    });

    // Обрабатываем подключение
    this.socket.on('connect', () => {
      this.socket.on('order', (data) => {
        console.log(data);
  
      });
      console.log('Socket connected');
    });

    // Обрабатываем ошибки
    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  // Подписка на событие "order"
  listOrder(callback) {
    if (typeof callback !== 'function') {
      throw new Error("Callback must be a function");
    }

    this.socket.on('order', (data) => {
      console.log(data);
      callback(data);
    });
  }

  // Отключаем и отписываемся
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners(); // Удаляем все слушатели
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }
}

export const socketEvents = new SocketEvents();