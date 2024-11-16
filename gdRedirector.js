let settings = {
    host: "http://192.168.0.143:8000/",
    youtube_link: "https://www.youtube.com/@real1tysurf",
    debug: false,
    // DEV OPTIONS
    // used for updating
    gd_createString: 0xCEA7DC, // Something like this --> FUN_00cd73ac(&local_20,"https://www.boomlings.com/database/getAccountURL.php",auStack_48);
    cc_sharedApp: 0xADF78C, // cocos2d::CCApplication::sharedApplication();
}

console.log('\
   ▄▄▄      █  ▄▄▄▄▄             █    ▀                           ▄                 \n\
 ▄▀   ▀  ▄▄▄█  █   ▀█  ▄▄▄    ▄▄▄█  ▄▄▄     ▄ ▄▄   ▄▄▄    ▄▄▄   ▄▄█▄▄   ▄▄▄    ▄ ▄▄ \n\
 █   ▄▄ █▀ ▀█  █▄▄▄▄▀ █▀  █  █▀ ▀█    █     █▀  ▀ █▀  █  █▀  ▀    █    █▀ ▀█   █▀  ▀\n\
 █    █ █   █  █   ▀▄ █▀▀▀▀  █   █    █     █     █▀▀▀▀  █        █    █   █   █    \n\
  ▀▄▄▄▀ ▀█▄██  █    ▀ ▀█▄▄▀  ▀█▄██  ▄▄█▄▄   █     ▀█▄▄▀  ▀█▄▄▀    ▀▄▄  ▀█▄█▀   █  \n\
                                                                                    \n\
                                                             v.1.2     by strainxx\n\
                        CHANGELOG:\n\
                v1.2: I finnaly figgured out how to intercept browser urls!\
')

let base = Process.findModuleByName('libcocos2dcpp.so').base;
let malloc = new NativeFunction(Module.findExportByName('libcocos2dcpp.so', 'malloc'), 'pointer', ['int']);


Interceptor.attach(base.add(settings.gd_createString), {
    onEnter: function(args){
        if(args[1].readCString().match(/http/)){
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
    }
})

// if (param_2) {
//     plVar2 = (long *)cocos2d::CCApplication::sharedApplication();
//     (**(code **)(*plVar2 + 0x60)) <--- 0x123( from here ) -^^ + 0x60
//               (plVar2,"https://www.boomlings.com/database/accounts/accountManagement.php");
// }
// Fuck

function doShitWithBrowserUrlReplacing(plVar2) {
    const vtable = Memory.readPointer(plVar2);
    const targetFunction = Memory.readPointer(vtable.add(0x60));
    // console.log("Browser func:", targetFunction);
    Interceptor.attach(targetFunction, {
        onEnter: function (args) {
            let origUrl = args[1].readUtf8String();
            let redirected = origUrl.replace("https://www.boomlings.com/", settings.host);
            redirected = redirected.replace("https://www.youtube.com/user/RobTopGames", settings.youtube_link);
            if(settings.debug){
                console.log(`AppsVtable::openBrowser(${plVar2}, "${origUrl}") called`);
            }
            console.log(`[+] Redirected openBrowser! ${origUrl} -> ${redirected}`);
            args[1] = createStringPtr(redirected);
        }
    })
}

Interceptor.attach(base.add(settings.cc_sharedApp), {
    onLeave: function(retval){
        // if(settings.debug){
        //     // console.log("cocos2d::CCApplication::sharedApplication() hit!")
        //     // console.log("Vtable pointer (long *): ",retval)
        // }
        doShitWithBrowserUrlReplacing(retval)
    }
})

function createStringPtr(message) {
    let charPtr = malloc(message.length + 1)
    Memory.writeUtf8String(charPtr, message)
    return charPtr;
}
