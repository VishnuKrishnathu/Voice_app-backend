import { isModuleNamespaceObject } from "util/types";

export {}
let mysql = require("mysql2");
require("dotenv").config();

interface IPool{
    host : string;
    port : string;
    user : string;
    password : string;
    database : string;
    connectionLimit : number;
}

class MySQLConnector{
    private pool : any;
    constructor(pool : IPool){
        this.pool = mysql.createPool(pool);
    }

    getPool(){
        return this.pool.promise();
    }
}

const myPoolConnect = new MySQLConnector({
    host : process.env.MYSQL_HOST,
    port : process.env.MYSQL_PORT,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    connectionLimit : 20
});

export const poolConnector = myPoolConnect.getPool();