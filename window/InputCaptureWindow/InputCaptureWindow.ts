import {BrowserWindow, Input, ipcMain} from "electron"
import { RemoteDevice } from "../../device/DevControl";
const path = require('node:path')
import {MergedInputStream} from  "./MergedInputStream"
import { SocketIPCServer } from "./SocketIPCServer";

export function createWindow(dev:RemoteDevice){
    const win = new BrowserWindow({
        // frame:false,
        // transparent:true,
        resizable:false,
        width:400,
        height:400,
        webPreferences: {
            autoplayPolicy: "no-user-gesture-required", // it not work, so we need a click
            preload: path.join(__dirname,"..", 'preload.js'),
            nodeIntegration:true,
          }
    })
    win.removeMenu()
    // win.webContents.openDevTools()
    win.loadFile(path.join(__dirname,"../../../static/InputCaptureWindow.html"))

    win.setTitle("ya2701 - demo 1")
    // let server = new SocketIPCServer();
    // (async()=>{
    //     server.listen(7988)
    // })();
    // server.dev = dev

    let lastInputPromise:any = new Promise((resolve)=>{
        resolve(undefined)
    })

    // the merged IO is not good, it's faster but breaks the mouse move
    // let mergedIO = new MergedInputStream(dev)
    // ipcMain.on("mousemove", (e,keys, x,y,wheel)=>{
    //     mergedIO.mouse(keys,x,y,wheel)
    // })
    // ipcMain.on("keyboard", (e, shift_keys:number, scan_codes:number[])=>{
    //     mergedIO.keyboard(shift_keys, scan_codes)
    // })


    ipcMain.on("mousemove", (e,keys, x,y,wheel)=>{
        lastInputPromise = lastInputPromise.then(()=>dev.moveMouseAsync(keys, x,y,wheel))
    })
    ipcMain.on("keyboard", (e, shift_keys:number, scan_codes:number[])=>{
        lastInputPromise = lastInputPromise.then(()=>dev.sendKeyboardAsync(shift_keys, scan_codes))
    })
    ipcMain.on("focusWindow", (e)=>{
        win.focus()
    })
}