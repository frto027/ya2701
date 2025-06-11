import { usb, Interface, Endpoint, OutEndpoint, InEndpoint, LibUSBException } from "usb"
import { Config } from "../config"

export class DevStatus {
    localAttached: boolean
    localSpeed: boolean // 1 means usb 3.0
    localSuspend: boolean

    remoteAttached: boolean
    remoteSpeed: boolean
    remoteSuspend: boolean
    constructor(buff: Buffer<ArrayBufferLike>) {
        if (buff.length != 2) {
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


export class RemoteDevice implements Disposable {
    dev: usb.Device
    interface?: Interface
    ep1_out?: OutEndpoint
    ep1_in?: InEndpoint
    ep2_out?: OutEndpoint
    ep2_in?: InEndpoint

    closed = false
    constructor(dev: usb.Device) {
        this.dev = dev
        dev.open()
        if (dev.interfaces && dev.interfaces.length > 5) {
            this.interface = dev.interfaces[5]
            this.interface.claim()
            this.ep1_in = this.interface.endpoint(0x89) as InEndpoint
            this.ep1_out = this.interface.endpoint(8) as OutEndpoint
            this.ep2_out = this.interface.endpoint(0xa) as OutEndpoint
            this.ep2_in = this.interface.endpoint(0x8B) as InEndpoint
            console.assert(this.ep1_in)
            console.assert(this.ep2_in)
            console.assert(this.ep1_out)
            console.assert(this.ep2_out)
        }
    }
    [Symbol.dispose](): void {
        this.close()
    }

    close() {
        if (this.closed) return
        this.closed = true
        this.dev.close()
    }

    switchToSuperSpeed(ondone: () => void, onerr: (err: usb.LibUSBException | undefined) => void) {
        let buff = Buffer.alloc(0)
        this.dev.controlTransfer(0x40,
            // 241
            242
            // 247
            , 0x7B06, 0x0300, buff, (err, buff) => {
                console.log(buff)
                if (err) {
                    onerr(err)
                } else {
                    this.close()
                    ondone()
                }
            })
    }

    switchToSuperSpeedAsync(): Promise<undefined> {
        return new Promise((resolve, rejected) => {
            this.switchToSuperSpeed(() => resolve(undefined), (err) => rejected(err))
        })
    }

    switchToHighSpeed(ondone: () => void, onerr: (err: usb.LibUSBException | undefined) => void) {
        let buff = Buffer.alloc(0)
        this.dev.controlTransfer(0x40,
            242
            , 0x7B06, 0x0200, buff, (err, buff) => {
                console.log(buff)
                if (err) {
                    onerr(err)
                } else {
                    this.dev.close()
                    ondone()
                }
            })
    }

    switchToHighSpeedAsync(): Promise<undefined> {
        return new Promise((resolve, rejected) => {
            this.switchToHighSpeed(() => resolve(undefined), (err) => rejected(err))
        })
    }


    getDevStatus(ondone: (status: DevStatus | undefined) => void, onerror: (err: usb.LibUSBException | undefined) => void) {
        this.dev.controlTransfer(0xc0, 0xf1, 0, 0, 2, (err, buff) => {
            if (err) {
                onerror(err)
            } else {
                if (buff && typeof (buff) != "number") {
                    ondone(new DevStatus(buff))
                } else {
                    onerror(undefined)
                }
            }
            // console.log(buff)
            // setTimeout(test, 1000)
        })
    }

    getDevStatusAsync(): Promise<DevStatus | undefined> {
        return new Promise((resolve, rejected) => {
            this.getDevStatus((status) => {
                resolve(status)
            }, (err) => {
                rejected(err)
            })
        })
    }


    moveMouse(x: number, y: number, wheel: number, ondone: () => void, onerr: (err: usb.LibUSBException) => void) {
        let buff = Buffer.alloc(4)
        buff[0] = 0x20
        buff[1] = x & 0xff
        buff[2] = y & 0xff
        buff[3] = wheel & 0xff
        this.dev.controlTransfer(0x40,
            9, 0, 3, buff, (err, buff) => {
                // console.log(buff)
                if (err) {
                    onerr(err)
                } else {
                    ondone()
                }
            })
    }

    moveMouseAsync(x: number, y: number, wheel: number): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.moveMouse(x, y, wheel, () => resolve(undefined), (err) => reject(err))
        })
    }

    sendKeyboard(shift_keys:number, scan_codes: number[], ondone: () => void, onerr: (err: usb.LibUSBException) => void) {
        let buff = Buffer.alloc(8, 0)
        buff[0] = shift_keys & 0xFF//scan code
        buff[1];//reversed
        for (let i = 0; i < scan_codes.length && i < 6; i++) {
            buff[2 + i] = scan_codes[i] & 0xFF
        }
        this.dev.controlTransfer(0x40,
            9, 0, 4, buff, (err, buff) => {
                // console.log(buff)
                if (err) {
                    onerr(err)
                } else {
                    ondone()
                }
            })
    }

    sendKeyboardAsync(shift_keys:number, scan_codes: number[]): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.sendKeyboard(shift_keys, scan_codes, () => resolve(undefined), (err) => reject(err))
        })
    }

    sendData(buff: Buffer, ondone: (actual: number) => void, onerr: (err: LibUSBException | undefined) => void) {
        if (this.ep1_out) {
            this.ep1_out.transfer(buff, (error: LibUSBException | undefined, actual: number) => {
                if (error) {
                    onerr(error)
                } else {
                    ondone(actual)
                }
            })
        } else {
            onerr(undefined)
        }
    }

    sendDataAsync(buff: Buffer): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.sendData(buff, actual => resolve(actual), (err) => reject(err))
        })
    }

    recvData(count: number, ondone: (buff?: Buffer) => void, onerr: (err: LibUSBException | undefined) => void) {
        if (this.ep1_in) {
            this.ep1_in.transfer(count, (error: LibUSBException | undefined, data?: Buffer) => {
                if (error) {
                    onerr(error)
                } else {
                    ondone(data)
                }
            })
        } else {
            onerr(undefined)
        }
    }

    recvDataAsync(count: number): Promise<Buffer | undefined> {
        return new Promise<Buffer | undefined>((resolve, reject) => {
            this.recvData(count, buff => resolve(buff), err => reject(err))
        })
    }

    static findAvaliableDevice(): RemoteDevice | undefined {
        let dev: usb.Device | null = null
        usb.getDeviceList().forEach((v) => {
            // it may not work for some devices, this is just an example
            if (Config.getInstance().getIntrestedDeviceDescriptor(v))
                dev = v
        })
        if(dev)
            return new RemoteDevice(dev)
        return undefined
    }
}