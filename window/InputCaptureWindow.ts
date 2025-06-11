import {BrowserWindow, ipcMain} from "electron"
import { RemoteDevice } from "../device/DevControl";
const path = require('node:path')

export function createWindow(dev:RemoteDevice){
    const win = new BrowserWindow({
        webPreferences: {
            // autoplayPolicy: "no-user-gesture-required", // it not work, so we need a click
            preload: path.join(__dirname, 'preload.js')
          }
      
    })
    win.webContents.openDevTools()
    win.loadFile("../static/InputCaptureWindow.html")

    let lastInputPromise:any = new Promise((resolve)=>{
        resolve(undefined)
    })

    //Optimize: we can merge the mouse and keyboard event.
    //But we need prevent the order. The key event can't be merged.
    ipcMain.on("mousemove", (e,keys, x,y,wheel)=>{
        lastInputPromise = lastInputPromise.then(()=>dev.moveMouseAsync(keys, x,y,wheel))
    })

    ipcMain.on("keyboard", (e, shift_keys:number, scan_codes:number[])=>{
        lastInputPromise = lastInputPromise.then(()=>dev.sendKeyboardAsync(shift_keys, scan_codes))
    })
}