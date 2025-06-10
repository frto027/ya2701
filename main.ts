import {findAvaliableDevice, RemoteDevice} from "./DevControl"

let d = findAvaliableDevice()
if(d){
    let dev = new RemoteDevice(d)
    function move(){
        dev.moveMouse(5,5,0, ()=>{
            move()
        }, ()=>{})
    }
    move()
}