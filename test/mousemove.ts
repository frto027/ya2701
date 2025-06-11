import {RemoteDevice} from "../device/DevControl"

import {sleep} from "../test/common"

async function test(){
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(1,0,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(0,1,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(-1,0,0)
        await sleep(10)
    }
    for(let i=0;i<30;i++){
        await dev.moveMouseAsync(0,-1,0)
        await sleep(10)
    }

    console.log("done")
} 

test()
