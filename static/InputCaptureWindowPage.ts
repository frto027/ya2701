document.body.addEventListener("keydown",(ev)=>{
    console.log(ev)
})
document.body.addEventListener("keyup",(ev)=>{
    console.log(ev)
    if(ev.key == "Escape"){
        //...
    }
})

document.body.addEventListener("click",()=>{
    document.body.requestPointerLock({
        unadjustedMovement:true
    }).then(()=>{

    })
})

let keys = {
    left:false,
    right:false,
    mid:false,
    extra1:false,
    extra2:false
}

document.body.addEventListener("mousedown", (ev)=>{
    if(document.pointerLockElement == document.body){
        keys.left = (ev.buttons & 1) != 0;
        keys.right = (ev.buttons & 2) != 0;
        keys.mid = (ev.buttons & 4) != 0;
        keys.extra1 = (ev.buttons & 8) != 0;
        keys.extra2 = (ev.buttons & 16) != 0;
        (window as any).control.mousemove(keys, 0,0, 0)
    }
})

document.body.addEventListener("mouseup", (ev)=>{
    if(document.pointerLockElement == document.body){
        keys.left = (ev.buttons & 1) != 0;
        keys.right = (ev.buttons & 2) != 0;
        keys.mid = (ev.buttons & 4) != 0;
        keys.extra1 = (ev.buttons & 8) != 0;
        keys.extra2 = (ev.buttons & 16) != 0;
        (window as any).control.mousemove(keys, 0,0, 0)
    }
})
document.body.addEventListener("wheel",(ev)=>{
    if(document.pointerLockElement == document.body){
        (window as any).control.mousemove(keys, 0,0, ev.deltaY / -100)
    }
})

document.body.addEventListener("mousemove", (ev)=>{
    if(document.pointerLockElement == document.body){
        (window as any).control.mousemove(keys, ev.movementX, ev.movementY, 0)
    }
})