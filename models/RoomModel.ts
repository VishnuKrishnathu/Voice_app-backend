import {Schema, model, Types} from 'mongoose';
import { poolConnector } from '../connection';

const roomModel = new Schema({
    roomName : {
        type: String,
        required: true
    },
    roomType : {
        type: String,
        required: true
    },
    roomDescription : {
        type: String,
        default: ""
    },
    admin : [{
        username : {
            type : String,
            required: true
        }
    }],
    owner : {
        type : String,
        required: true
    },
    roomMembers : [{
        username : {
            type: String
        }
    }]
}, {
    timestamps: true
});

module.exports.RoomModel = model('Room', roomModel);

class SQLRoomMember {
    private roomId :string;
    private members :Array<any>;
    private static TABLENAME = "roomMembers";
    private keyname :string;
    constructor( roomId :string, members :Array<any>, keyname :string ){
        this.roomId = roomId;
        this.members = members;
        this.keyname = keyname;
    }

    async addMember(){
        try{
            let QUERY_STRING_1 = `SELECT entryId from roomLookupTable WHERE mongoRoomId='${this.roomId}'`;
            let [rowsLookup, filedslookup ] = await poolConnector.execute(QUERY_STRING_1);
            if(!rowsLookup || rowsLookup.length !== 1){
                throw new Error("Couldn't add members to the room");
                return;
            }
            let tableValues = this.members.map(member => `(${rowsLookup[0].entryId}, ${member[this.keyname]}, 1)`);
            let QUERY_STRING = `INSERT INTO ${SQLRoomMember.TABLENAME} (roomId, memberId, pendingRequest)
            VALUES ${tableValues.toString()}`;
            let [rows, fileds ] = await poolConnector.execute(QUERY_STRING);
            return {rows};
        }catch(err){
            console.log(err);
            throw new Error("Error adding the members to the database");
        }
    }

    static async findRoomsById(userId :number){
        try{
            let TABLENAME = SQLRoomMember.TABLENAME;
            let QUERY_STRING = `SELECT ${TABLENAME}.roomId, ${TABLENAME}.memberId, roomLookupTable.roomName FROM ${TABLENAME}
            LEFT JOIN roomLookupTable ON ${TABLENAME}.roomId=roomLookupTable.entryId
            WHERE memberId=${userId} AND NOT ISNULL(${TABLENAME}.roomId)`;
            let [rows, fields] = poolConnector.execute(QUERY_STRING);
            return rows;
        }
        catch(err){
            console.log(err);
            throw new Error("Error in finding the rooms by ID")
        }
    }

    static async addAdmin(roomId :string, memberId :number, roomName :string){
        try{
            let QUERY_STRING = `INSERT INTO roomLookupTable (mongoRoomId, roomName)
            VALUES ('${roomId}', '${roomName}')`;
            let [ rowslookup, fieldslookup ] = await poolConnector.execute(QUERY_STRING);
            let QUERY_STRING_1 = `INSERT INTO ${SQLRoomMember.TABLENAME} (roomId, memberId, isAdmin)
            VALUES (${rowslookup.insertId}, ${memberId}, 1)`;
            let [rows, fileds ] = await poolConnector.execute(QUERY_STRING_1);
            return {rows};
        }
        catch(err){
            console.log(err);
            throw new Error("Error in adding the admin to the database");
        }
    }

    static async deleteRoom(roomId :string){
        try{
            let QUERY_STRING = `DELETE FROM ${SQLRoomMember.TABLENAME}
            WHERE roomId='${roomId}'`;
            let [rows, fields] = await poolConnector.execute(QUERY_STRING);
            return {
                rows
            }
        }
        catch(err){
            console.log(err);
            throw new Error("error deleting the room from MYSQL database");
        }
    }

    static async findMembersByRoomId(roomId :string){
        try{
            let QUERY_STRING = `SELECT roomMembers.isAdmin, users.username as label, users.userId as value FROM ${SQLRoomMember.TABLENAME}
            LEFT JOIN users
            ON ${SQLRoomMember.TABLENAME}.memberId=users.userId
            WHERE roomMembers.roomId='${roomId}'`;
            let [ rows, fields ] = await poolConnector.execute(QUERY_STRING);
            return rows;
        }
        catch(err){
            console.log(err);
            throw new Error("Error finding the room Members");
        }
    }
}

module.exports.SQLRoomMember = SQLRoomMember;