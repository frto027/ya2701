import { usb } from "usb"

export class DevStatus{
    localAttached:boolean
    localSpeed:boolean // 1 means usb 3.0
    localSuspend:boolean

    remoteAttached:boolean
    remoteSpeed:boolean
    remoteSuspend:boolean
    constructor(buff:Buffer<ArrayBufferLike>){
        if(buff.length != 2){
            throw Error("invalid buffer length for DevStatus")
        }
        this.localSuspend = (buff[0] & 1) != 0
        this.localSpeed = (buff[0] & 2) != 0
        this.localAttached = (buff[0] & 4) != 0

        this.remoteSuspend = (buff[1] & 1) != 0
        this.remoteSpeed = (buff[1] & 2) != 0
        this.remoteAttached = (buff[1] & 4) != 0
    }
}


export class RemoteDevice{
    dev:usb.Device
    constructor(dev:usb.Device){
        this.dev = dev
        dev.open()
    }

    switchToHighSpeed(ondone:()=>void, onerr:(err:usb.LibUSBException|undefined)=>void){
        let buff = Buffer.alloc(0)
        this.dev.controlTransfer(0x40, 
            // 241
            247
            , 0x7B06,0x0200,buff,(err,buff)=>{
            console.log(buff)
            if(err){
                onerr(err)
            }else{
                ondone()
            }
        })
    }

    getDevStatus(ondone:(status:DevStatus|undefined)=>void, onerror:(err:usb.LibUSBException|undefined)=>void){
        this.dev.controlTransfer(0xc0, 0xf1, 0,0,2,(err,buff)=>{
            if(err){
                onerror(err)
            }else{
                if(buff && typeof(buff) != "number"){
                    ondone(new DevStatus(buff))
                }else{
                    onerror(undefined)
                }
            }
            // console.log(buff)
            // setTimeout(test, 1000)
        })

    }

    moveMouse(x:number, y:number, wheel:number, ondone:()=>void, onerr:(err:usb.LibUSBException)=>void){
        let buff = Buffer.alloc(4)
        buff[0] = 0x20
        buff[1] = x & 0xff
        buff[2] = y & 0xff
        buff[3] = wheel & 0xff
        this.dev.controlTransfer(0x40, 
            9, 0,3,buff,(err,buff)=>{
            // console.log(buff)
            if(err){
                onerr(err)
            }else{
                ondone()
            }
        })
    }

    //not tested
    sendKeyboard(scan_codes:number[], ondone:()=>void, onerr:(err:usb.LibUSBException)=>void){
        let buff = Buffer.alloc(8, 0)
        buff[0] = 0//scan code
        buff[1];//reversed
        for(let i=0;i<scan_codes.length && i < 6;i++){
            buff[2+i] = scan_codes[i] & 0xFF
        }
        this.dev.controlTransfer(0x40, 
            9, 0,4,buff,(err,buff)=>{
            // console.log(buff)
            if(err){
                onerr(err)
            }else{
                ondone()
            }
        })
    }

    
}

export function findAvaliableDevice():usb.Device|null{
    let dev : usb.Device|null = null
    usb.getDeviceList().forEach((v)=>{
        // console.log(v.deviceDescriptor)
        // it may not work for some devices, this is just an example
        if(v.deviceDescriptor.idVendor == 0xea0 && v.deviceDescriptor.idProduct == 0x7301)
            dev = v
    })
    return dev
}
