const mongoose=require('mongoose');
const Category = require('./Category');
const TransactionSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,

    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true,
        default:'INR',
        maxlength:3

    },
    date: {
    type: Date,
    required: true
},

    description:{
        type:String,
        default:'',
        trim:true
    },
    category_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:Category,
    default:null 
    },
    source:{
        type:String,
        default:'manual'
    },
    tags:{
        type:[String],
        default:[],
    },
    meta:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    }

})


module.exports = mongoose.model('Transaction', TransactionSchema);
