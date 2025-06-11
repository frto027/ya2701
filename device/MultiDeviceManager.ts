import { usb } from "usb";
import { RemoteDevice } from "./DevControl";
import { Config } from "../config";

export class MultiDeviceManager{
    static manager:MultiDeviceManager
    static getManager():MultiDeviceManager{
        if(!MultiDeviceManager.manager)
            MultiDeviceManager.manager = new MultiDeviceManager()
        return MultiDeviceManager.manager
    }


    usbdevices:usb.Device[] = []

    remotedevices:(RemoteDevice|undefined)[] = []

    flushDevices(){
        let seen_devices = new Set<string>()
        let valid_devices = new Set<string>()
        let newly_added_devices:usb.Device[] = []

        this.usbdevices.forEach(v=>{
            let key = `${v.busNumber}.${v.deviceAddress}`
            seen_devices.add(key)
        })

        usb.getDeviceList().forEach((v) => {
            if (Config.getInstance().getIntrestedDeviceDescriptor(v))
            {
                let key = `${v.busNumber}.${v.deviceAddress}`
                if(seen_devices.has(key)){
                    //ok
                }else{
                    newly_added_devices.push(v)
                }
                valid_devices.add(key)
            }
        })

        let new_usbdevices = []
        let new_remotedevices = []

        for(let i=0;i<this.usbdevices.length;i++){
            let key = `${this.usbdevices[i].busNumber}.${this.usbdevices[i].deviceAddress}`
            if(valid_devices.has(key)){
                new_usbdevices.push(this.usbdevices[i])
                new_remotedevices.push(this.remotedevices[i])
            }else{
                try{
                    this.remotedevices[i]?.close()
                }catch(e){

                }
            }
        }

        newly_added_devices.forEach(v=>{
            new_usbdevices.push(v)
            new_remotedevices.push(undefined)
        })
        this.usbdevices = new_usbdevices
        this.remotedevices = new_remotedevices
    }

    open(i:number):RemoteDevice|undefined{
        if(this.usbdevices[i] && !this.remotedevices[i]){
            this.remotedevices[i] = new RemoteDevice(this.usbdevices[i])
        }
        return this.remotedevices[i]
    }

    close(i:number){
        if(this.remotedevices[i]){
            this.remotedevices[i].close()
            this.remotedevices[i] = undefined
        }
    }

    closeAll(){
        for(let i=0;i<this.remotedevices.length;i++){
            this.close(i)
        }
    }
}