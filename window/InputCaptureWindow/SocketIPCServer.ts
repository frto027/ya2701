// seems just the same effect as IPC, so not used

import { createServer } from "node:net";
import { RemoteDevice } from "../../device/DevControl";

let auth_key =  Buffer.from("v1:aabbccddd")

export class SocketIPCServer{
    static instance:SocketIPCServer

    dev?:RemoteDevice

    getInstance() : SocketIPCServer{
        if(!SocketIPCServer.instance){
            SocketIPCServer.instance = new SocketIPCServer()
        }
        return SocketIPCServer.instance
    }

    handleMousePackage(buff:Buffer){
        if(this.dev){
            this.dev.moveMouseAsync(buff[0], buff[1], buff[2], buff[3])
        }
    }

    server
    constructor(){
        let me = this
        this.server = createServer(function(socket){
            let killTask = setTimeout(()=>{
                socket.destroy()
            }, 3000)
        
            let current_auth_step = 0
        
            socket.once("data", auth)
            function auth(data:Buffer){
                let taken_data = 0
                for(let i=0;i<data.length && current_auth_step < auth_key.length;i++){
                    if(data[i] == auth_key[current_auth_step]){
                        current_auth_step++
                        taken_data++
                    }else{
                        socket.destroy()
                        clearTimeout(killTask)
                    }
                }
                if(current_auth_step == auth_key.length){
                    clearTimeout(killTask)
                    if(taken_data < data.length){
                        serve(data.subarray(taken_data))
                    }
                    socket.on("data", serve)
                }else{
                    socket.once("data", auth)
                }
            }
            
            let acc = Buffer.alloc(4)
            let acc_count = 0
        
            function serve(data:Buffer){
                for(let i=0;i<data.length;i++){
                    acc[acc_count++] = data[i]
                    if(acc_count == acc.length){
                        me.handleMousePackage(acc)
                        acc_count = 0
                    }
                }
            }
            socket.on("error",()=>{
                //ignore error
            })
        })
        
    }

    listen(port:number){
        this.server.listen(port)
    }
}
