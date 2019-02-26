const devConfig = require('./dev');
const testConfig = require('./test');
const proConfig = require('./pro');
const johnConfig = require('./john');
const apis = require('./api');
var mysql = require('mysql');
let configArg = process.argv[2];

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
    if(!config){
        console.error("没有对应的配置文件");
        return;
    }
    updateAppVersion(config);
}

/**
 * 
 * @param {*} data 
 */
function updateAppVersion(data){
    let version = data.version;
    let urls = new Array();
    for (const api of apis) {
        urls.push(api.path);
    }
    
var conn = mysql.createConnection({
  host     : data.database.host,
  user     : data.database.user,
  password : data.database.password,
  database : data.database.database,
  debug: true
});

 
let sql = {
    "queryApiIds":'SELECT id from bcm_api_info where url in (\''+urls.join("','")+'\')',
    "deleteApi":'delete from bcm_app_api where app_version = \''+version+'\'',
    "insertAppVersion":'insert bcm_app_api(app_version,api_id) values ?',
    "queryNewsIds":'SELECT id from bcm_news limit 100',
} 

let apiIds = [];
 
    conn.query(sql.queryApiIds, function (error, results, fields) {
        if (error) throw error;
        console.log('The queryApiIds success! ');
        console.log(sql)
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            apiIds.push([version,result.id]);
        }
        console.log("sql.deleteApi ->> ",sql.deleteApi)
        conn.query(sql.deleteApi, function (error, results, fields) {
            if (error) throw error;
            console.log('The deleteApi success! ');
            console.log("sql.insertAppVersion ->> ",sql.insertAppVersion)
            console.log("apiIds --- > >>>>>>>>>>>>>>>>> ",apiIds)
            conn.query(sql.insertAppVersion, [apiIds], function (error, results, fields) {
                if (error) throw error;
                console.log('The insertAppVersion success! ');
                conn.end();
            });
        });
    });
}

rebuildConfig();