const bcrypt = require("bcrypt");
const {mySQLConnect} = require("../connection");

class UsersSchema{
    private static date = new Date();
    protected emailId : string;
    protected password : string;
    protected username : string;
    private createdAt : string;
    private updatedAt : string;
    static TABLENAME = "users";
    private static dateString = `${UsersSchema.date.getFullYear()}-${UsersSchema.date.getMonth() +1}-${UsersSchema.date.getDate()} ${UsersSchema.date.getHours()}:${UsersSchema.date.getMinutes()}:${UsersSchema.date.getSeconds()}`;
    constructor (emailId : string, password : string, username : string){
        let date = new Date();
        this.emailId = emailId;
        this.password = password;
        this.username = username;
        this.createdAt= UsersSchema.dateString;
        this.updatedAt= UsersSchema.dateString;
    }

    async hashPassword() : Promise<void>{
        try{
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);
        } catch(err){
            console.log("error in hashing password", err);
        }
    }

    async save(){
        try{
            let connection = await mySQLConnect();
            let QUERY_STRING = `INSERT INTO ${UsersSchema.TABLENAME} (emailId, password, username, createdAt, updatedAt) 
            VALUES ('${this.emailId}', '${this.password}', '${this.username}', '${this.createdAt}', '${this.updatedAt}')`;
            let [rows, fields] = await connection.execute(QUERY_STRING);
            return {
                rows,
                fields
            }
        }catch(err){
            console.log("Error while saving the query", err);
            throw new Error("Error while saving data to the databse");
        }
    }

    static async findOne(userdata : {
        emailId ?: string,
        password ?: string,
        username ?: string,
        userId ?: number
    }) : Promise<any>{
        try{
            type Tdata = "emailId" | "password" | "username" | "userId";
            let connection = await mySQLConnect();
            let data : Tdata;
            let whereClause: Array<string | number> = [];
            for(data in userdata){
                whereClause.push(`${data}='${userdata[data]}'`);
            }
            let QUERY_STRING = `SELECT * FROM ${UsersSchema.TABLENAME} WHERE ${whereClause.toString().replace(",", " AND ")}`;
            let [[rows], fields] = await connection.execute(QUERY_STRING);
            return rows;
        }catch(err){
            console.log(err);
            throw new Error("Error in finding the required document");
        }
    }
    // function to compare the passwords
    static async loginUser(username :string, password : string){
        try{
            console.log("executed")
            let user = await this.findOne({username});
            if(user){
                let res_password = await bcrypt.compare(password, user.password);
                if (res_password) return user;
                throw new Error("User has entered the wrong password");
            }else{
                throw new Error("User has entered the wrong email address");
            }
        }
        catch(err){
            console.log(err);
            throw new Error("Wrong arguments passed to the loginUser function");
        }
    }
}

module.exports.SQLUserModel = UsersSchema;