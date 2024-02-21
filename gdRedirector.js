let settings = {
    host: "http://192.168.0.143:8000/",
    debug: false
}

console.log('\
   ▄▄▄      █  ▄▄▄▄▄             █    ▀                           ▄                 \n\
 ▄▀   ▀  ▄▄▄█  █   ▀█  ▄▄▄    ▄▄▄█  ▄▄▄     ▄ ▄▄   ▄▄▄    ▄▄▄   ▄▄█▄▄   ▄▄▄    ▄ ▄▄ \n\
 █   ▄▄ █▀ ▀█  █▄▄▄▄▀ █▀  █  █▀ ▀█    █     █▀  ▀ █▀  █  █▀  ▀    █    █▀ ▀█   █▀  ▀\n\
 █    █ █   █  █   ▀▄ █▀▀▀▀  █   █    █     █     █▀▀▀▀  █        █    █   █   █    \n\
  ▀▄▄▄▀ ▀█▄██  █    ▀ ▀█▄▄▀  ▀█▄██  ▄▄█▄▄   █     ▀█▄▄▀  ▀█▄▄▀    ▀▄▄  ▀█▄█▀   █  \n\
                                                                                    \n\
                                                             v.1.0     by strainxx\
')

let base = Process.findModuleByName('libcocos2dcpp.so').base;
let malloc = new NativeFunction(Module.findExportByName('libcocos2dcpp.so', 'malloc'), 'pointer', ['int']);


Interceptor.attach(base.add(0xccf99c), {
    onEnter: function(args){
        if(args[1].readCString().match(/boomlings/)){
            let orig = args[1].readCString() 
            if(settings.debug){
                console.log(Date.now(),"Arg 1:", args[0])
                console.log(Date.now(), "Arg 2:", args[1].readCString())
                console.log(Date.now(), "Arg 3:", args[2])
                console.log("Is matching:", args[1].readUtf8String().match(/boomlings/))
            }
            args[1] = createStringPtr(args[1].readCString().replace("https://www.boomlings.com/", settings.host))
            console.log("[+] Redirected", orig, "to", args[1].readCString());
            
        }
        
        // args[1] = createStringPtr("http://127.0.0.1:8000")
        // console.log(Date.now(), "Patched Arg 2:", args[1].readUtf8String())
    }
})

function createStringPtr(message) {
    let charPtr = malloc(message.length + 1)
    Memory.writeUtf8String(charPtr, message)
    return charPtr;
}