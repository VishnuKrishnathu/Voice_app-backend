import { poolConnector } from "../connection";
type tData = [existingRow : Array<any>, existingFields : any];

export class FriendlistSchema {
    private static TABLENAME = 'friendlist';
    private userId : number;
    private friendId : number;

    constructor(userId :number, friendId :number){
        this.userId = userId;
        this.friendId = friendId;
    }

    async sendRequest(){
        try{
            let connection = poolConnector;

            // query to check friend
            let CHECKING_QUERY_STRING = `SELECT * FROM ${FriendlistSchema.TABLENAME}
            WHERE (userId=${this.userId} AND friendId=${this.friendId}) OR
            (userId=${this.friendId} AND friendId=${this.userId});`;
            let [ existingRow, existingFields] : tData = await connection.query(CHECKING_QUERY_STRING);
            if(existingRow.length !== 0 || !existingRow) {
                return {
                    rows : [],
                    fields : {}
                }
            }

            // query to add friend
            let QUERY_STRING = `INSERT INTO ${FriendlistSchema.TABLENAME} (userId, friendId, pendingRequest)
            VALUES ('${this.userId}', '${this.friendId}', 1)`;

            let [rows, fields] = await connection.query(QUERY_STRING);
            return {
                rows,
                fields
            }

        }catch(err){
            console.log('Error in adding friend', err);
            throw new Error('Error in adding friend');
        }
    }

    static async acceptRequest(userId : number, friendId : number){
        try{
            let CHECKING_QUERY_STRING = `SELECT * FROM ${FriendlistSchema.TABLENAME}
            WHERE userId='${friendId}' AND friendId='${userId}'`;
            let [ checkedRows, checkedFields ] :tData= await poolConnector.query(CHECKING_QUERY_STRING);
            if(checkedRows.length == 0 || !checkedRows){
                throw new Error('Friend Request not accepted');
                return ;
            }

            let UPDATE_STRING = `UPDATE ${FriendlistSchema.TABLENAME}
            SET pendingRequest=0 WHERE userId=${friendId} AND friendId=${userId}`;

            let [ rows, fields ] = await poolConnector.query(UPDATE_STRING);
            return {
                rows,
                fields
            }
        }
        catch(err){
            console.log(err);
            throw new Error('Friend Request not accepted');
        }
    }
}
