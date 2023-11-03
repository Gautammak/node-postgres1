
module.exports = (sequelize,DataTypes) => {
const Event = sequelize.define('Event', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    // inviteeIds:DataTypes.INTEGER
    
    inviteeIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // Define an array of integers
    },
    creatorId:{
      type:DataTypes.INTEGER
    } 

  },{ 
    
    createdAt:"created_At",
    updatedAt:"modified_at"
 
});
  
 return Event;
  
}