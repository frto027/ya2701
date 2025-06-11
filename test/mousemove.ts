import {RemoteDevice} from "../device/DevControl"

import {sleep} from "../test/common"

async function test(){
    let emptyKeys = {
        left:false,
        right:false,
        mid:false,
        extra1:false,
        extra2:false
    }
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(emptyKeys, 1,0,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(emptyKeys, 0,1,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(emptyKeys, -1,0,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(emptyKeys, 0,-1,0)
        await sleep(10)
    }

    console.log("done")
} 

test()
