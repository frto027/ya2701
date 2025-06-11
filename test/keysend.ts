import {RemoteDevice} from "../device/DevControl"

import {sleep} from "../test/common"

async function test(){
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }

    for(let i=0;i<26;i++){
        await dev.sendKeyboardAsync(0, [0x4 + i])
        await sleep(20)
        await dev.sendKeyboardAsync(0, [])
        await sleep(20)
    }

    console.log("done")
} 

test()
