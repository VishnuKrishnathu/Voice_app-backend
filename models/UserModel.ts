const bcrypt = require("bcrypt");
import { poolConnector } from '../connection';

class UsersSchema{
    private static date = new Date();
    protected emailId : string;
    protected password : string;
    protected username : string;
    private createdAt : string;
    private updatedAt : string;
    private static TABLENAME = "users";
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
            let connection = poolConnector;
            let QUERY_STRING = `INSERT INTO ${UsersSchema.TABLENAME} (emailId, password, username, createdAt, updatedAt) 
            VALUES ('${this.emailId}', '${this.password}', '${this.username}', '${this.createdAt}', '${this.updatedAt}')`;
            let [rows, fields] = await connection.query(QUERY_STRING);
            console.log("user created", rows);
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
            let connection = poolConnector;
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

    static async findUsingRegex(columnName : string, value : string, username : string, userId : number) {
        try{
            let connection = poolConnector;
            let QUERY_STRING = `SELECT U.userId as value, U.emailId as emailAddress, U.username as label, T.friendId, T.pendingRequest AS requestSent,
            T.userId as foreignUserID FROM ${UsersSchema.TABLENAME} as U
            LEFT JOIN (SELECT * FROM friendlist WHERE friendlist.userId=${userId} OR friendlist.friendId=${userId} )as T
            ON U.userId=T.userId OR U.userId=T.friendId
            WHERE LOWER(U.${columnName}) REGEXP '${value}.*' AND U.${columnName} != '${username}'`;

            let [ rows , fields ] = await connection.execute(QUERY_STRING);
            return rows;
        }catch(err){
            console.log("Error find the username using REGEX", err);
            throw Error("Error find the username using REGEX");
        }
    }

    static async findFriendsUsingRegex(value :string, username: string, userId :number, roomId: string){
        try{
            let QUERY_STRING = `SELECT U.userId as value, U.username as label, F.userId as foreignUserId, F.friendId FROM users AS U
            RIGHT JOIN (SELECT userId, friendId FROM friendlist WHERE (userId=${userId} OR friendId=${userId}) AND pendingRequest=0) AS F
            ON U.userId=F.userId OR U.userId=F.friendId
            WHERE LOWER(U.username) REGEXP '${value}.*' AND U.username != '${username}'`;

            let M_VALUES = `roomMembers.roomId, roomMembers.memberId, roomLookupTable.mongoRoomId`;

            let QUERY_STRING_1 = `SELECT DISTINCT Z.value, Z.label FROM (${QUERY_STRING}) AS Z
            LEFT JOIN (SELECT ${M_VALUES} FROM roomMembers LEFT JOIN roomLookupTable ON roomMembers.roomId=roomLookupTable.entryId) AS M
            ON Z.value=M.memberId
            WHERE M.mongoRoomId!='${roomId}' OR ISNULL(M.memberId)`;
            // `;
            let SQL_STRING = `SELECT ${M_VALUES} FROM roomMembers LEFT JOIN roomLookupTable ON roomMembers.roomId=roomLookupTable.entryId`;
            console.log(SQL_STRING);

            let [ rows, fields ] = await poolConnector.execute(QUERY_STRING_1);
            console.log("add members", rows);
            return rows;
        }
        catch(err){
            console.log(err);
            throw new Error('Error finding the friend try again');
        }
    }
}

module.exports.SQLUserModel = UsersSchema;