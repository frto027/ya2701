import {RemoteDevice} from "./device/DevControl"

async function main(){
    using dev = RemoteDevice.findAvaliableDevice()
    if(!dev){
        console.error("device not fouhnd")
        return
    }

    //do something with dev?

    console.log("done")
} 

main()
