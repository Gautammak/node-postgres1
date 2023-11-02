const express = require('express');
require("./models");
const userCtrl = require("./controllers/userController");

const verifyToken = require('./middleware/verifyTokens');
const cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());

app.use(cookieParser())
const port = 4000;


app.get("/", (req,res)=>{
    res.send("hello world")
});


app.post("/register" ,userCtrl.userRegister);
app.post('/login',  verifyToken, userCtrl.userLogin)
app.post("/logout", verifyToken, userCtrl.userLogout);
app.post('/change-password',verifyToken  ,userCtrl.userChangepassword)
app.post("/reset-request" , userCtrl.resetRequest)
app.post('/update-password', userCtrl.userUpdatepassword );
app.post("/create-event" ,verifyToken , userCtrl.createEvent);
app.get('/getEvent',verifyToken, userCtrl.getEvent)

app.listen(port,()=>{
    console.log(`app is listening at http://localhost:${port}`);
})