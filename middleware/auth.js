const jwt = require("jsonwebtoken");


const authToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
 
  try {
    const decoded = jwt.verify(token, 'hash-brownie');
    console.log(decoded +"token exp")
    req.user = decoded;
    console.log(req.user.id)
    next();
  }
  catch (err) {
    res.status(400).send('Invalid token.');
    console.log(err);
  }
}

  
  exports.authToken = authToken
  
  