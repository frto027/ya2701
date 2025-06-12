import {RemoteDevice} from "./device/DevControl"

import {app} from "electron"

async function main(){
    let dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }

    //do something with dev?
    await app.whenReady()
    
    require("./window/InputCaptureWindow/InputCaptureWindow").createWindow(dev)

    // console.log("done")
} 

main()
