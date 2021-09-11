import { mySQLConnect } from "../connection";

export class FriendlistSchema {
    private static TABLENAME = 'friendlist';
    private userId : number;
    private firendId : number;

    constructor(userId :number, friendId :number){
        this.userId = userId;
        this.firendId = friendId;
    }

    async sendRequest(){
        try{
            let connection = await mySQLConnect();
            let QUERY_STRING = `INSERT INTO ${FriendlistSchema.TABLENAME} (userId, friendId, pendingRequest)
            VALUES ('${this.userId}', '${this.firendId}', 1)`;

            let [rows, fields] = await connection.execute(QUERY_STRING);
            return {
                rows,
                fields
            }

        }catch(err){
            console.log('Error in adding friend', err);
            throw new Error('Error in adding friend');
        }
    }
}
