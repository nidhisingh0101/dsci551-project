import express from "express";
import passport from "passport";
import passportLocal from "passport-local"
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import UserSchema from "../models/User.js";

mongoose.connect('mongodb://localhost:27019/Authentication',{dbName:"Authentication"})
        .then(()=>console.log("User Database connected")).catch((e)=>console.error(e))

const UserModel = mongoose.model('user', UserSchema);

const LocalStrategy = passportLocal.Strategy
const router = express.Router()

const SESSION_KEY = "discostrangler333"

const storeOptions = { 
    mongoUrl : 'mongodb://localhost:27019/Authentication',
}

router.use(session({
    secret:SESSION_KEY,
    resave:false,
    saveUninitialized:true,
    store: MongoStore.create(storeOptions),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Max age of the session cookie in milliseconds
        secure: false, // Set to true in production for HTTPS
        sameSite: 'strict', // Controls cookie sending behavior
    }, 
}))

router.get("/",(req,res)=> res.send("Working Auth"))

const strategy = new LocalStrategy(UserModel.authenticate())

passport.use(strategy)
passport.serializeUser(UserModel.serializeUser())
passport.deserializeUser(UserModel.deserializeUser())

router.use(passport.initialize())
router.use(passport.session())

export const isAuthenticated = (req,res,next) => {
    console.log('Authenticating')
    if(req.isAuthenticated()){
        console.log('Authenticatedrs')
        return next()
    }
}
  

router.post("/register", (req,res) => {
    UserModel.register(
        new UserModel({ 
          email: req.body.email,
          name: req.body.name,
          type: req.body.type,
        }), req.body.password, function (err, msg) {
          if (err) {
            res.status(400).send(err);
          }
          else{
            res.status(200).send({'message':'Successful Registration'})
          }
        }
    )
})


router.post('/login',
    passport.authenticate('local', { 
        failureRedirect: '/auth/login-failure', 
        failureMessage: true,
        successMessage: true
    }), 
    (req, res, next) => {
        console.log("logged in",req.body)
        const { username,type } = req.body
        UserModel.findOne({email:username})
        .then(data => {
            console.log(data)
            if(type==data.type){
                res.status(200).send({ message: "Successful", user: data})
            }
            else res.status(400).send({ message: 'No Authorization' })
        })
});

router.get('/login-failure', (req, res, next) => {
    console.log(req.session.messages)
    res.status(400).send('Login Attempt Failed.');
});

router.put('/update', async (req,res) => {
    console.log('Adding Medicine')
    const { email,medicines,cartvalue } = req.body
    console.log(email,medicines,cartvalue)
    const medicinesObjects = medicines.map(item => {
        const [name, count] = item.split('-');
        return { name, count: parseInt(count, 10) };
      });
    UserModel.updateOne({email: email},{$set:{medicines: medicinesObjects,cartvalue: cartvalue}})
    .then((data) => res.status(200).send({message: 'Update Successful',data}))
    .catch((data) => res.status(400).send({message: 'Update Unsuccessful',data}))
})



export const UserRouter = router