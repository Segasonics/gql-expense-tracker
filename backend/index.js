import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import {connectDB} from './db/connectDB.js';
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { buildContext } from "graphql-passport";
import { configurePassport } from "./passport/passport.config.js";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import job from "./cron.js";

dotenv.config();
configurePassport();

job.start();

const __dirname =path.resolve();//this basically means root of our application
// Required logic for integrating with Express
const app = express();

const httpServer = http.createServer(app);

const MongoDBStore = connectMongo(session);//In this line of code we are using connect-mongodb-session to store session data in the "sessions" collection

const store = new MongoDBStore({
    uri:process.env.MONGO_URI,
    collection:"sessions",
});

store.on("error",(err)=>console.log(err));

app.use(
    //This tells Express to use MongoDB for storing session data.
    session({
        secret:process.env.SESSION_SECRET,
        resave:false,//this option specifies whether to save the session to the store on every request
        saveUninitialized:false, //this option specifies whether to save uinitialized sessions ||// Don't create empty sessions
        cookie:{
            maxAge:1000*60*60*24*7,// Expire in 7 days
            httpOnly:true, //this option prevents the cross-site scripting (xss) attacks
        },
        store:store
    })
)
 
app.use(passport.initialize());
// ensures that Passport can store authentication data in the session.
app.use(passport.session());

const server = new ApolloServer({
  typeDefs:mergedTypeDefs,
  resolvers:mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})
 
//Ensure we wait for our server to start
await server.start();

//Set up our Express middleware to handle CORS, body parsing,
//and our expressMiddleware function
app.use(
    '/graphql',
    cors({
        origin:'http://localhost:3000',
        credentials:true,
    }),
    express.json(),
    //expressMiddleware accepts the same arguments:
    //an Apollo Server instance and optional configuration options

    expressMiddleware(server,{
        context:async({req,res})=>buildContext({req,res}),//If a user is logged in, buildContext will attach req.user (user details) to the GraphQL context.
    }),
);

//use for deploying in render
//npm run build will build your frontend app, and it will give us the optimized version of the app
app.use(express.static(path.join(__dirname,"frontend/dist")));
app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend/dist","index.html"))//any route other than graphql we should be able to see react application
})

//Modified server startup
await new Promise((resolve)=>httpServer.listen({port :4000}, resolve));
await connectDB()
 
console.log(`🚀 Server ready at http://localhost:4000/graphql`)