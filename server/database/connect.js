// import mongoose from "mongoose";

// import { MongoMemoryServer } from "mongodb-memory-server";

// async function connect() {
//     const mongod = await MongoMemoryServer.create();
//     const getUri = mongod.getUri();
//     const db = await mongoose.connect(getUri);
//     console.log("DB Connected");
//     console.log(getUri)
//     return db;

// }

// export default connect;

import mongoose from 'mongoose';

async function connect() {
    try {
        const uri = 'mongodb+srv://abcd:abcd@mydb.jemibyk.mongodb.net/UIUsers?retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('DB Connected');
        console.log('MongoDB URI:', uri);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error, error.reason);
    }
}

export default connect;