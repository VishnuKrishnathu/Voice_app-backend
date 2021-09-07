export {}
let mysql = require("mysql2/promise");
require("dotenv").config();

// Connecting to the mysql server
async function mySQLConnect(){
    try{
        let connection = await mysql.createConnection({
            host : process.env.MYSQL_HOST,
            port : process.env.MYSQL_PORT,
            user : process.env.MYSQL_USER,
            password : process.env.MYSQL_PASSWORD,
            database : process.env.MYSQL_DATABASE
        });
        return connection;
    }catch(err){
        console.log(err);
        throw new Error("Error in connecting to the database");
    }
}

// connection.connect(function (err: any) {
//     if(err){
//         console.log(`Something bad happended in the database`, err.stack);
//         return;
//     }

//     console.log(`Connected as id ${connection.threadId}`);
// });

module.exports.mySQLConnect = mySQLConnect;