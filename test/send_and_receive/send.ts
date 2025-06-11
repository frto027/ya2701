import {RemoteDevice} from "../../device/DevControl"

async function test(){
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }
    
    let buff = Buffer.alloc(20)
    for(let i=0;i<buff.length;i++){
        buff[i] = i
    }

    let sent_count = await dev.sendDataAsync(buff)
    console.log("data sent:" + sent_count)
    console.log("done")
} 

test()
