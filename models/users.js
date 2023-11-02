

module.exports = (sequelize,DataTypes) => {
 
    const User = sequelize.define('User', {
    
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            unique: true,
          },
        password: DataTypes.STRING
    }, { 
        underscored:true,
        createdAt:"created_At",
        updatedAt:"modified_at"
     
    });  
    return User;
    
    }