import { RemoteDevice } from "../../device/DevControl"

// not good, try another solution

class InputHandler{
    next?:InputHandler
    done = false
    mouse(keys:number,x:number,y:number,wheel:number){
        this.next = new MouseHandler(keys,x,y,wheel)
        return this.next
    }
    keyboard(shift_keys:number, scan_codes:number[]){
        this.next = new KeyHandler(shift_keys, scan_codes)
        return this.next
    }
    exec(dev:RemoteDevice):Promise<undefined>{
        return new Promise<undefined>(r=>r(undefined))
    }
}
class MouseHandler extends InputHandler{
    keys:number
    x:number
    y:number
    wheel:number
    constructor(keys:number,x:number,y:number,wheel:number){
        super()
        this.keys = keys
        this.x = x
        this.y = y
        this.wheel = wheel
    }

    mouse(keys: number, x: number, y: number, wheel: number) {
        let nx = x + this.x
        let ny = y + this.y
        let nw = wheel + this.wheel
        if(!this.done && keys == this.keys
            && nx >= - 0x80 && nx < 0x7F
            && ny >= - 0x80 && ny < 0x7F
            && nw >= - 0x80 && nw < 0x7F
        ){
            this.x = nx
            this.y = ny
            this.wheel = nw
            return this
        }else{
            this.next = new MouseHandler(keys,x,y,wheel)
            return this.next
        }
    }

    exec(dev:RemoteDevice):Promise<undefined>{
        return dev.moveMouseAsync(this.keys,this.x,this.y,this.wheel)
    }
}

class KeyHandler extends InputHandler{
    shift_keys:number
    scan_codes:number[]
    constructor(shift_keys:number, scan_codes:number[]){
        super()
        this.shift_keys = shift_keys
        this.scan_codes = scan_codes
    }
    exec(dev:RemoteDevice):Promise<undefined>{
        return dev.sendKeyboardAsync(this.shift_keys, this.scan_codes)
    }

    // no we don't need merge the keyboard, it's never a performance problem
    // keyboard(shift_keys:number, scan_codes:number[]){
    //     this.next = new KeyHandler(shift_keys, scan_codes)
    //     return this.next
    // }

}

export class MergedInputStream{
    dev:RemoteDevice

    next_exec_handler:InputHandler

    handler:InputHandler

    is_executing = false
    is_closed = false
    current_exec
    constructor(dev:RemoteDevice){
        this.dev = dev
        this.handler = new InputHandler()
        this.next_exec_handler = this.handler
        this.next_exec_handler.done = true
        this.current_exec = this.exec_concurrent()
    }
    mouse(keys:number,x:number,y:number,wheel:number){
        if(this.handler){
            this.handler = this.handler.mouse(keys,x,y,wheel)
        }else{
            this.handler = new MouseHandler(keys, x,y,wheel)
        }
        this.start_exec_async()
    }
    keyboard(shift_keys:number, scan_codes:number[]){
        if(this.handler){
            this.handler = this.handler.keyboard(shift_keys,scan_codes)
        }else{
            this.handler = new KeyHandler(shift_keys,scan_codes)
        }
        this.start_exec_async()
    }

    private async *exec_concurrent(){
        this.is_executing = true
        while(true){
            while(this.next_exec_handler.done && this.next_exec_handler.next){
                this.next_exec_handler = this.next_exec_handler.next
            }
            while(true){
                await this.next_exec_handler.exec(this.dev)
                this.next_exec_handler.done = true
                if(this.next_exec_handler.next){
                    this.next_exec_handler = this.next_exec_handler.next
                }else{
                    this.is_executing = false
                    yield
                    this.is_executing = true
                }
            }
        }
    }
    
    private start_exec_async(){
        if(this.is_executing){
            // no need
        }else{
            this.current_exec.next()
        }
    }

    async close(){
        this.is_closed = true
        await this.current_exec.return()
    }
}
