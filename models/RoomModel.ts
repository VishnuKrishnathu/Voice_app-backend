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
    private tableValues :Array<string>;
    constructor( roomId :string, members :Array<any>, keyname :string ){
        this.roomId = roomId;
        this.members = members;
        this.tableValues = members.map(member => `('${roomId}', ${member[keyname]})`);
    }

    async addMember(){
        try{
            let QUERY_STRING = `INSERT INTO ${SQLRoomMember.TABLENAME} (roomId, memberId)
            VALUES ${this.tableValues.toString()}`;
            let [rows, fileds ] = await poolConnector.execute(QUERY_STRING);
            return {rows};
        }catch(err){
            console.log(err);
            throw new Error("Error adding the members to the database");
        }
    }

    static async addAdmin(roomId :string, memberId :number){
        try{
            let QUERY_STRING = `INSERT INTO ${SQLRoomMember.TABLENAME} (roomId, memberId, isAdmin)
            VALUES ('${roomId}', ${memberId}, 1)`;
            let [rows, fileds ] = await poolConnector.execute(QUERY_STRING);
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