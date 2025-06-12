let capture_element = document.body!;

let current_keys = new Set()
let modifier_keys = 0

let enable_full_screen_capture = true

function sendKeyboardEvent(){
    let array: any[] = [];
    current_keys.forEach(v=>{
        array.push(v)
    });
    (window as any).control.sendkeyboard(modifier_keys & 0xFF, array);
}

function sendKeyPress(ctrl:boolean, alt:boolean, shift:boolean, metaKey:boolean, keycode:string, release_ms = 100): Promise<undefined>{
    (window as any).control.sendkeyboard(
        (ctrl ? 1 : 0) | (alt ? 4 : 0) | (shift ? 2 : 0) | (metaKey ? 8 : 0),
        [(window as any).codemap[keycode]]
    );
    return new Promise((r)=>{
        setTimeout(()=>{
            (window as any).control.sendkeyboard(0, []);
            r(undefined)
        }, release_ms)
    })
}

document.body.addEventListener("keydown",(ev)=>{
    if(!isCaptured())
        return
    // console.log(ev)
    if(ev.code == 'KeyS' && ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && document.pointerLockElement == capture_element){
        leaveCapture()
    }else{
        if(ev.code == "ControlLeft"){
            modifier_keys |= 1;
        }else if(ev.code == "ShiftLeft"){
            modifier_keys |= 2;
        }else if(ev.code == "AltLeft"){
            modifier_keys |= 4;
        }else if(ev.code == "MetaLeft"){
            modifier_keys |= 8;
        }else if(ev.code == "ControlRight"){
            modifier_keys |= 16;
        }else if(ev.code == "ShiftRight"){
            modifier_keys |= 32;
        }else if(ev.code == "AltRight"){
            modifier_keys |= 64;
        }else if(ev.code == "MetaRight"){
            modifier_keys |= 128;
        }else{
            let scancode = (window as any).codemap[ev.code]
            if(scancode){
                current_keys.add(scancode)
            }
        }
        sendKeyboardEvent()
    }
    ev.preventDefault()
})
document.body.addEventListener("keyup",(ev)=>{
    if(!isCaptured())
        return
    if(ev.code == "ControlLeft"){
        modifier_keys &=~ 1;
    }else if(ev.code == "ShiftLeft"){
        modifier_keys &=~ 2;
    }else if(ev.code == "AltLeft"){
        modifier_keys &=~ 4;
    }else if(ev.code == "MetaLeft"){
        modifier_keys &=~ 8;
    }else if(ev.code == "ControlRight"){
        modifier_keys &=~ 16;
    }else if(ev.code == "ShiftRight"){
        modifier_keys &=~ 32;
    }else if(ev.code == "AltRight"){
        modifier_keys &=~ 64;
    }else if(ev.code == "MetaRight"){
        modifier_keys &=~ 128;
    }else{
        let scancode = (window as any).codemap[ev.code]
        if(scancode){
            current_keys.delete(scancode)
        }
    }
    sendKeyboardEvent()

    ev.preventDefault()
})

// let can_enter_capture = true
// document.body.addEventListener("mouseenter",()=>{
//     if(can_enter_capture){
//         can_enter_capture = false
//         enterCapture(true)
//     }
// })
// document.body.addEventListener("mouseleave",()=>{
//     can_enter_capture = true
// })
// document.getElementById("capture_btn")!.addEventListener("click",()=>{
//     enterCapture(false)
// })

function isCaptured(){
    return document.pointerLockElement == capture_element
}

let container = document.getElementById("container")!
let fullscreen = document.getElementById("fullscreen")!

function enterCaptureContinue(){
    console.log("done")
    if(enable_full_screen_capture){
        document.body.requestFullscreen().then(()=>{
            (navigator as any).keyboard.lock()
        })
    }
}
function enterCaptureErr(err:any){
    console.error(err)
    leaveCapture()
}

document.onpointerlockchange = (e)=>{
    if(!isCaptured()){
        leaveCapture()
    }
}

function enterCapture(enableFullscreen:boolean){
    if(isCaptured())
        return;
    container.style.display = "none"
    fullscreen.style.display = "";

    if(!enableFullscreen){
        document.body.requestPointerLock({
            unadjustedMovement:true
        }).then(()=>{
            //we can't focus keyboard, because it's only supported in fullscreen mode
        }).catch(()=>{
            leaveCapture()
        });
        return
    }

    (window as any).control.focusWindow();
    setTimeout(()=>{
        (window as any).execWithGesture(`
            document.body.requestPointerLock({
                unadjustedMovement:true
            }).then(enterCaptureContinue).catch(enterCaptureErr);
            `)
    },20);
    // capture_element.requestPointerLock({
    //     unadjustedMovement:true
    // }).then(()=>{
    //     if(enable_full_screen_capture){
    //         document.body.requestFullscreen();
    //         (navigator as any).keyboard.lock();    
    //     }
    // })
}

function leaveCapture(){
    container.style.display = ""
    fullscreen.style.display = "none"
    if(current_keys.size > 0 || modifier_keys != 0){
        current_keys.clear()
        modifier_keys = 0
        sendKeyboardEvent()
    }
    document.exitPointerLock();
    if(enable_full_screen_capture){
        (navigator as any).keyboard.unlock();
    }
    if(document.fullscreenEnabled && document.fullscreenElement){
        document.exitFullscreen();    
    }
}

// import { Socket } from "net"

function mousemove(keys:number, x:number,y:number,wheel:number){
    (window as any).control.mousemove(keys,x,y,wheel)
}

let keys:number = 0

capture_element.addEventListener("mousedown", (ev)=>{
    if(isCaptured()){
        keys = ev.buttons;
        mousemove(keys, 0,0,0)
    }
})

capture_element.addEventListener("mouseup", (ev)=>{
    if(isCaptured()){
        keys = ev.buttons;
        mousemove(keys, 0,0, 0)
    }
})
capture_element.addEventListener("wheel",(ev)=>{
    if(isCaptured()){
        mousemove(keys, 0,0, ev.deltaY / -100)
    }
})

capture_element.addEventListener("mousemove", (ev)=>{
    if(isCaptured()){
        mousemove(keys, ev.movementX, ev.movementY, 0)
    }
})