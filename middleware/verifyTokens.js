const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const token = tokenParts[1];

  jwt.verify(token, 'Node-Exam', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
console.log('decoded >>>>>>', decoded);
    req.user = { id: decoded.id };
   // req.email = {email:decoded.email}
   
  });
  next();
}

module.exports = verifyToken





