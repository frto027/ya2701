const {contextBridge, ipcRenderer, webFrame} = require("electron")

let control = {
  mousemove: (keys:any, x:number,y:number,wheel:number) => ipcRenderer.send('mousemove',keys, x,y,wheel),
  // mousemove: (keys:any, x:number,y:number,wheel:number) => socketMouse(keys,x,y,wheel),
  sendkeyboard: (shift_keys:number, scan_codes: number[]) =>ipcRenderer.send("keyboard", shift_keys, scan_codes),
  enterCapture: ()=>ipcRenderer.send("enterCapture"),
  focusWindow: ()=>ipcRenderer.send("focusWindow"),
}
contextBridge.exposeInMainWorld("execWithGesture", (str:string)=>{
  // return new Promise(r=>webFrame.executeJavaScript(str, true, (result:any, error:any)=>{console.log(error); r(undefined)}))
  webFrame.executeJavaScript(str, true)
})
contextBridge.exposeInMainWorld('control', control)


///////////////////////// with socket server IPC //////////////
//which one is better? same?
// import { Socket } from "node:net"
// let socket = new Socket()
// console.log(socket)
// socket.connect({
//     host:"localhost",
//     port:7988
// }, ()=>{
//     socket.write(Buffer.from("v1:aabbccddd"))
// })
// function socketMouse(keys:number, x:number,y:number,wheel:number){
//   let buff = Buffer.alloc(4)
//   buff[0] = keys|0;
//   buff[1] = x|0;
//   buff[2] = y|0;
//   buff[3] = wheel|0;
//   socket.write(buff,(err:any)=>{})
// }
// control.mousemove = socketMouse
