import { usb } from "usb"

interface DeviceDescriptor{
    vid:number
    hid:number
    name:string
}

export class Config{
    static instance:Config

    static getInstance(){
        if(!Config.instance){
            Config.instance = new Config()
        }
        return Config.instance
    }

    intrestedKeys:DeviceDescriptor[] = [
        {
            vid:0xea0,
            hid:0x7301,
            name:"default"
        }
    ]
    constructor(){

    }

    getIntrestedDeviceDescriptor(dev:usb.Device):DeviceDescriptor|undefined{
        let keys = Config.getInstance().intrestedKeys
        for(let i=0;i<keys.length;i++){
            if(dev.deviceDescriptor.idVendor == keys[i].vid && dev.deviceDescriptor.idProduct == keys[i].hid){
                return keys[i]
            }
        }
        return undefined
    }
    
}