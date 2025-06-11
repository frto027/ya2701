const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('control', {
    mousemove: (keys:any, x:number,y:number,wheel:number) => ipcRenderer.send('mousemove',keys, x,y,wheel),
    sendkeyboard: (shift_keys:number, scan_codes: number[]) =>ipcRenderer.send("keyboard", shift_keys, scan_codes)
  })
