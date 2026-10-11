// ==================================================
// CareerLink - Authentication Middleware
// ==================================================
// JWT token verify karta hai protected routes ke liye
// Bina valid token ke protected APIs access nahi ho paayengi

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

// Yeh middleware JWT token ko verify karta hai
// Agar token valid hai tabhi protected route access hoga
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Authorization header se Bearer token nikalo
    // Format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Agar token nahi mila toh unauthorized
    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    // JWT token verify karo - secret key se decode hoga
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token se user ID nikal ke MongoDB se user fetch karo
    const user = await User.findById(decoded.userId).select('-__v');

    // Agar user nahi mila (deleted/invalid) toh unauthorized
    if (!user) {
      throw new UnauthorizedError('User not found. Token may be invalid.');
    }

    // User info request object mein attach karo
    // Baaki controllers mein req.user se access hoga
    req.user = user;
    req.userId = user._id;

    logger.debug(`Authenticated user: ${user.email} (${user.role})`);

    next();
  } catch (error) {
    // JWT specific errors aur parsing errors handle karo
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'SyntaxError' ||
      error instanceof SyntaxError ||
      error.name === 'CastError'
    ) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(error);
  }
};

module.exports = authenticate;

// ### Basic

// 1. **Backend:** Application ka background part jo logic, APIs, authentication aur database operations handle karta hai.
// 2. **Node.js:** JavaScript ko browser ke bahar/server par run karne ka runtime hai.
// 3. **Express.js:** Node.js ka framework hai jo server aur APIs banana easy karta hai.
// 4. **MongoDB:** Application ka data store karne wala NoSQL database hai.
// 5. **Firebase:** Humne Firebase ko user authentication ke liye use kiya hai.
// 6. **API:** Frontend aur backend ke beech communication ka interface hai.
// 7. **REST API:** HTTP methods aur endpoints ke through resources ko access/manage karne wali API hai.
// 8. **JSON:** Data exchange karne ka lightweight format hai.
// 9. **HTTP:** Client aur server ke beech communication ka protocol hai.

// ### Project Architecture

// 10. **Backend architecture:** Request → Route → Middleware → Controller → Service → Model → MongoDB → Response.
// 11. **Why Node.js:** JavaScript mein fast aur scalable backend banane ke liye.
// 12. **Why Express.js:** APIs, routing aur HTTP requests ko easily handle karne ke liye.
// 13. **Why MongoDB:** Flexible document-based data ko easily store/manage karne ke liye.
// 14. **Why Firebase:** Secure and easy user authentication ke liye.
// 15. **Route → Controller → Service → Model:** Route request ko direct karta hai, Controller handle karta hai,
//  Service logic chalata hai aur Model database data handle karta hai.
// 16. **Controller vs Service:** Controller request/response handle karta hai, Service business logic handle karta hai.
// 17. **Route vs Controller:** Route endpoint define karta hai, Controller request ko process karta hai.
// 18. **Middleware:** Request aur response ke beech checks/processing karne wala function hai.

// ### HTTP/API

// 19. **GET vs POST:** GET data retrieve karta hai, POST new data create karta hai.
// 20. **POST vs PUT:** POST new resource create karta hai, PUT existing resource update karta hai.
// 21. **PUT vs PATCH:** PUT generally complete resource update karta hai, PATCH partial update karta hai.
// 22. **DELETE:** Existing data/resource ko remove karta hai.
// 23. **HTTP status code:** Server ke response ka result batane wala numeric code hai.
// 24. **200:** Request successfully complete hui.
// 25. **201:** Resource successfully create hua.
// 26. **400:** Client ki request invalid hai.
// 27. **401:** User authenticated nahi hai.
// 28. **403:** User authenticated hai but permission nahi hai.
// 29. **404:** Requested resource nahi mila.
// 30. **500:** Server-side error hua.

// ### Authentication/Security

// 31. **Authentication:** User ki identity verify karna.
// 32. **Authorization:** User ko kya access allowed hai ye check karna.
// 33. **Difference:** Authentication = WHO ARE YOU; Authorization = WHAT CAN YOU DO.
// 34. **Firebase authentication:** Firebase email/password verify karke user ko authenticate karta hai aur ID token deta hai.
// 35. **Firebase ID token:** Firebase authentication ke baad milne wala user identity proof hai.
// 36. **JWT:** User identity/claims ko securely represent karne wala token hai.
// 37. **Why middleware:** Authentication, authorization, validation aur other checks request ke before karne ke liye.
// 38. **CORS:** Different frontend/backend origins ko safely communicate karne allow karta hai.
// 39. **Helmet:** HTTP security headers set karke Express application ki security improve karta hai.
// 40. **Rate limiting:** Ek IP se limited time mein excessive requests ko restrict karta hai.
// 41. **Input validation:** Invalid ya malicious data ko application mein enter hone se rokne ke liye.

// ### Database

// 42. **Model:** Database data ka structure/blueprint define karta hai.
// 43. **MongoDB:** NoSQL document-based database hai.
// 44. **Collection:** MongoDB mein related documents ka group hai.
// 45. **Document:** MongoDB mein ek individual data record hai.
// 46. **Users:** User profile, role, skills jaise data User model mein store hote hain.
// 47. **Jobs:** Job details jaise title, description aur skills Job model mein store hote hain.
// 48. **Applications:** Jobseeker, job, resume, cover letter aur status Application model mein store hote hain.
// 49. **Why MongoDB instead of SQL:** Flexible document structure aur easy scalability ke liye.

// ### CareerLink Features

// 50. **Job creation:** Recruiter request bhejta hai, authorization/validation ke baad job MongoDB mein save hoti hai.
// 51. **Job application:** Jobseeker job select karke resume/cover letter submit karta hai aur application database mein save hoti hai.
// 52. **Recruiter applicants:** Backend job ID ke basis par related applications fetch karke recruiter ko return karta hai.
// 53. **Role-based access:** Backend user ke role ko check karke allowed actions provide karta hai.
// 54. **Resume upload:** Resume file backend par upload hoti hai aur server usse process/store karta hai.
// 55. **Resume parsing:** PDF/DOCX/DOC se text extract karke name, email, phone aur skills identify kiye jaate hain.
// 56. **Recommendations:** User skills ko job skills ke saath compare karke matching jobs recommend hoti hain.
// 57. **AI-based recommendation:** No, recommendation system rule-based skill matching algorithm use karta hai.
// 58. **Match percentage:** Matched skills ÷ total job skills × 100 se percentage calculate hota hai.

// ### Backend Files

// 59. **server.js:** MongoDB/Firebase initialize karke Express server start karta hai.
// 60. **app.js:** Express application, middleware, routes, Swagger aur error handling configure karta hai.
// 61. **package.json:** Project ki dependencies, scripts aur metadata define karta hai.
// 62. **.env:** Environment variables aur configuration values store karta hai.
// 63. **Why not push .env:** Secrets aur sensitive credentials leak hone se bachane ke liye.
// 64. **Swagger:** API documentation aur testing interface hai.
// 65. **/health:** Backend aur MongoDB connection ki health check karta hai.
// 66. **Error handling:** Centralized error middleware errors ko catch karke proper response bhejta hai.
// 67. **MongoDB down:** Database requests fail hongi aur health endpoint degraded/unhealthy status show karega.
