
module.exports = (sequelize,DataTypes) => {
const User_Event = sequelize.define('user_event', {
    UserId: DataTypes.INTEGER,
    EventId: DataTypes.INTEGER, 
  },{ 
   
    timestamps:false
});

  
 
 return User_Event ;
  
}