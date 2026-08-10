const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,           // removes extra spaces
            minlength: 3          // more realistic than array with min length check
        },
        email: {
            type: String,
            required: true,
            unique: true,         // ensures no duplicate emails
            lowercase: true       // always store in lowercase
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        pic: {
            type: String,
            default:
                "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
