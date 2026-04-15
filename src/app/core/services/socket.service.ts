import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
    private socket!: Socket;

   

    connect(userId: number) {
    this.socket = io('http://localhost:3000');
    
     this.socket.on("connect", () => {
      console.log("Socket connected ✅");
  });

     this.socket.emit("join" , userId);
   
  }

 onExpenseUpdate() {
  return new Observable((observer) => {
    this.socket.on('expenseUpdate', (data: any) => {
      console.log("Expense Update:", data);
      observer.next(data);
    });
  });
}

   constructor() { }
}
