var db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const User = db.users;
const Event = db.events;

const userRegister = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const data = {
      firstname,
       lastname,
      email,
      password: await bcrypt.hash(password, 10),
    };
    //saving the user
    const user = await User.create(data);
 
    //if user details is captured
    //generate token with the user's id and the secretKey in the env file
    // set cookie with the token generated
    if (user) {
      let token = jwt.sign({ id: user.id }, "Node-Exam", {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });
 
      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      console.log("user", JSON.stringify(user, null, 2));
      console.log(token);
      //send users details
      return res.status(201).send(user);
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.log(error);
  }
 };

const userLogin = async (req, res) => {
  try {
 const { email, password } = req.body;
 
    //find a user by their email
    const user = await User.findOne({
      where: {
      email: email
    } 
      
    });
 
    //if user email is found, compare password with bcrypt
    if (user) {
      const isSame = await bcrypt.compare(password, user.password);
 
      //if password is the same
       //generate token with the user's id and the secretKey in the env file
 
      if (isSame) {
        let token = jwt.sign({ id: user.id }, "Node-Exam", {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        });
 
       
        res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        console.log("user", JSON.stringify(user, null, 2));
        console.log(token);
        //send user data
        return res.status(201).send(user);
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication   failed");
    }
  } catch (error) {
    console.log(error);
  }
 };




// Create an array to store revoked tokens
const tokenBlacklist = [];

const userLogout = async (req, res) => {
  try {
    // Get the token from the request cookies
    const token = req.cookies.jwt;

    // Check if the token is in the blacklist
    if (tokenBlacklist.includes(token)) {
      return res.status(401).json({ error: 'Token already revoked' });
    }

    // Add the token to the blacklist
    tokenBlacklist.push(token);

    // Optionally, you can clear the token from the client-side by setting an expired cookie
    res.cookie('jwt', '', { expires: new Date(0) });

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Change password route
const userChangepassword = async (req, res) => {
  try {
    const {email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({
      where: {
      email: email
    } 
      
    });

    // Verify the current password
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: 'Incorrect current password or Email' });
    }

    // Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    // Optionally, you can clear the token from the client-side by setting an expired cookie
    res.cookie('jwt', '', { expires: new Date(0) });

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Password change failed' });
  }
};

var resetRequest = async (req, res) => {
  const { email } = req.body;
  
  // Find the user by email
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

 
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000;

  
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = resetTokenExpiry;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'gm962460@gmail.com',
      pass: 'mhmb mymw wodv ommp',
    },
  });

  const resetLink = `https://localhost:3000/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: 'gm962460@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending failed: ', error);
      res.status(500).json({ error: 'Email sending failed' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Password reset link sent successfully' });
    }
  });
}




const userUpdatepassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by their email address
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Update the user's password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: 'Password Update successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  


// const  createEvent = async(req,res) =>{
// try {
//   const { title, description, date, inviteeIds } = req.body;

//   console.log(req.body);
//   const creatorId = req.user.id; // Get the ID of the authenticated user
//   console.log(creatorId);
//   // Create the event
//   const event = await Event.create({ title, description, date, creatorId });
 
//   // Invite users to the event by their IDs
//   if (inviteeIds && inviteeIds.length > 0) {
//     const invitedUsers = await User.findAll({ where: { id: inviteeIds } });
  
//     if (invitedUsers) {
//       await event.addInvitees(invitedUsers);
//     }
//   }

//   return res.status(201).json(event);
// } catch (error) {
//   console.error(error);
//   return res.status(500).json({ error: 'Event creation failed' });
// }
//   }



const createEvent = async (req, res) => {
  try {
    const { title, description, date, inviteeIds } = req.body;
    console.log(req.body);
    const creatorId = req.user.id; // Get the ID of the authenticated user
    console.log(creatorId);

    // Create the event
    const event = await Event.create({ title, description, date, creatorId });

    console.log('Created event:', event);

    // Invite users to the event by their IDs
    if (inviteeIds && inviteeIds.length > 0) {
      const invitedUsers = await User.findAll({ where: { id: inviteeIds } });

      console.log('Invited users:', invitedUsers);

      if (invitedUsers) {
        await event.addInvitees(invitedUsers);
      }
    }

    return res.status(201).json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Event creation failed' });
  }
}

  
var getEvent = async (req, res) => {
  
  try {
    const userId = req.user.id; // Get the ID of the authenticated user
  
      //Find events where the user is the creator
     const createdEvents = await Event.findAll({ where: { creatorId: userId } });
     console.log(createdEvents);
      //Find events where the user is invited
      const invitedEvents = await Event.findAll({
        include: [
          {
            model: User,
            as: 'invitees',
            where: { id: userId }, // Check if the user is among the invitees
          },
        ],
      });
     console.log("invited" , invitedEvents);
      return res.status(200).json({ createdEvents, invitedEvents });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Event retrieval failed' });
    }
}
  





module.exports = {
  userRegister,
  userLogin,
  userLogout,
  userChangepassword,
  resetRequest,
  userUpdatepassword,
  createEvent,
  getEvent
};









