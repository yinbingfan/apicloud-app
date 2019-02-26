const fs = require('fs');
const apis = require('./api');

function update(){
    let root = "./view/";
    let scripts = readAppScript(root);
    let oldkey = "url"
    let newkey = "newurl"
    replaceUrl(scripts,oldkey,newkey);
}

function replaceUrl(paths,oldkey,newkey) {
    var map = [];
    for (const api of apis) {
        map[api[oldkey]]=api[newkey];
        let key = api.url.replace(/\'/g,"\"");
        map[key]=api[newkey];  
    } 

    for (const key in map) {
        console.log(" key ->>>> ",key)
    }  
    
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        var data = fs.readFileSync(path,'utf8');
        let str = data.toString('utf8');    
        for (const key in map) {
            str = replaceApiUrl(str,key,map[key]);
        } 
        fs.writeFileSync(path,str,'utf8')
        console.log(" wirted ",path);
    }
}
function replaceApiUrl(str,key,val){

        str = str.replace(key,val);
        if(str.indexOf(key)>0)
        {
            console.log(" 再替换一次 ",key);
            str = replaceApiUrl(str,key,val);         
        }
        
    return str;
}
function readAppScript(root){
    var scripts = new Array();
    let dirs = fs.readdirSync(root);
    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];  
        if(isDir(root+dir)){
            let sc = readAppScript(root+dir+"/");
            scripts = scripts.concat(sc)
            if(fs.existsSync(root+dir+"/script.js")){
                scripts.push(root+dir+"/script.js");
            }            
        }
    }
    return scripts;
} 
function isDir(path){
    return fs.existsSync(path)&&fs.statSync(path).isDirectory()
}

update();

 
