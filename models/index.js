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

  module.exports = db;