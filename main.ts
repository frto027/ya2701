import path from "path"
import {RemoteDevice} from "./device/DevControl"

import {app, BrowserWindow} from "electron"

async function loadStaticHtml(path:string){
    await app.whenReady()
    const win = new BrowserWindow({
        resizable:false,
        width:400,
        height:400,
    })
    win.removeMenu()
    win.loadFile(path)

    win.setTitle("Error")
}


async function main(){
    try{
        let dev = RemoteDevice.findAvaliableDevice()
        if(!dev){
            console.error("device not fouhnd")
            loadStaticHtml(path.join(__dirname, "../static/errors/NoDeviceSupported.html"))
            return
        }

        //do something with dev?
        await app.whenReady()
        
        require("./window/InputCaptureWindow/InputCaptureWindow").createWindow(dev)
    }catch(e){
        if(!(e instanceof Error)){
            throw e
        }
        if(e.message == "LIBUSB_ERROR_NOT_SUPPORTED"){
            loadStaticHtml(path.join(__dirname, "../static/errors/DeviceOpenFailed.html"))
        }else{
            throw e
        }
    }
} 

main()
