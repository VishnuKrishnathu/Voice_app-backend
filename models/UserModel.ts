const bcrypt = require("bcrypt");
import { Schema, model, Query } from "mongoose";


interface IUser {
    emailId: string,
    password: string
}


const userModel = new Schema<IUser>({
    emailId : {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});


userModel.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userModel.static("login" , async function(email: string, password: string) {
    console.log(email);
    const user = await this.findOne({emailId : email});
    console.log(user);
    if(user){
        let res_password = await bcrypt.compare(password, user.password);
        if (res_password) return user;
        throw new Error("User has entered the wrong password");
    }else {
        throw new Error("User has entered the wrong email address");
    }
});

module.exports = model('Usersdata', userModel);