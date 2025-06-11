import {RemoteDevice} from "../../device/DevControl"

async function test(){
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }
    while(true){
        let buff = await dev.recvDataAsync(1024)
        console.log(buff)    
    }
} 

test()
