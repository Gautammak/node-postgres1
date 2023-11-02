const {Sequelize, DataTypes }= require('sequelize');

const sequelize = new Sequelize('event_management', 'postgres', 'Password', {
  host: 'localhost',
  dialect: 'postgres' ,
  logging:true
});

  sequelize.authenticate()
  .then(()=>{
    console.log("connected");
  })
  .catch(err => {
    console.log("error" + err);
  });


  const db = {};
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;



  sequelize.sync({force:false})
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch((error) => {
    console.error('Error synchronizing the database:', error);
  });

  db.users = require("./users")(sequelize,DataTypes);
  db.events = require("./events")(sequelize,DataTypes);
  db.user_event = require("./user_event")(sequelize,DataTypes);

   


  db.user_event.belongsTo(db.users);
  db.user_event.belongsTo(db.events);
  db.users.hasMany(db.user_event);
  db.events.hasMany(db.user_event);
  
  db.users.belongsToMany(db.events, { through: db.user_event, as: 'events' });
  db.events.belongsToMany(db.users, { through: db.user_event, as: 'invitees' });

  module.exports = db;