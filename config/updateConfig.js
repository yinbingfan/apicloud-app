const fs = require('fs');
const formatJson = require('format-json-pretty');
const devConfig = require('./dev');
const testConfig = require('./test');
const proConfig = require('./pro');
const johnConfig = require('./john');
let configArg = process.argv[2];
console.log(" 更新配置为 --->>>> ", configArg);
let configName = 'config.js'

function rebuildConfig(){
    let config = null;
    switch(configArg){
        case "dev":
            console.log("dev"," 更新 "+configArg+" api配置");

            config = devConfig;
            break;
        case "test":
            console.log("test"," 更新 "+configArg+" api配置");
            config = testConfig;
            break
        case "pro":
            console.log("pro"," 更新 "+configArg+" api配置");
            config = proConfig;
            break;
        case "john":
            console.log("john"," 更新 "+configArg+" api配置");
            config = johnConfig;
            break;
        default:
        break;
    }
    delete config["database"]
    let configContent = "window.appcfg = "+formatJson(config)
    if(!config){
        console.error("没有对应的配置文件");
        return;
    }

    fs.writeFile(configName,configContent,(err)=>{
        if (err) throw err;
        // console.log(' The file has been saved!');
        console.warn(configArg +' 配置已经生成!');

    })
}
rebuildConfig();
