const { User } = require("../store/config");
const bcrypt = require("bcryptjs");
const { createError } = require("../error");
const validator = require("validator");
const jwt = require("jsonwebtoken");

//SIGN UP (CREATE USER)
const signup = async (req, res, next) => {
  try {
    // Validate the input
    const { email, mobileNo, password, username } = req.body;
    if (!email && !mobileNo)
      return next(createError(400, "Email or Mobile number required!!"));
    const mobileNumberRegex = /^[1-9]\d{9}$/;

    if (email && !validator.isEmail(email)) {
      return next(createError(400, "Invalid Email Address!!!"));
    } else if (mobileNo && !mobileNumberRegex.test(mobileNo)) {
      return next(createError(400, "Invalid mobile number!!!"));
    }

    if (!password || password.length < 8) {
      return next(
        createError(400, "Password must be at least 8 characters!!!")
      );
    }

    if (!username || username.length < 6) {
      return next(
        createError(400, "User name must be at least 6 characters!!!")
      );
    }

    //Check email or mobile no already exist in db or not
    if (email) {
      const id = await isUserExist("email", email);
      if (id) return next(createError(400, "Email Address already exist!!!"));
    }

    if (mobileNo) {
      const id = await isUserExist("mobileNo", mobileNo);
      if (id) return next(createError(400, "Mobile number already exist!!!"));
    }

    // Encrypt password using bcrypt library
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = await User.add({
      ...req.body,
      password: hash,
      imageUrl: "",
      email: req.body.email || "",
      mobileNo: req.body.mobileNo || "",
    });

    res.status(201).json({
      success: true,
      message: "User has been created",
    });
  } catch (error) {
    next(createError(401, "Error occurred!!"));
  }
};

//SIGN IN

const signin = async (req, res, next) => {
  try {
    let loginUser;

    const userEmail = req.body.email;

    const userMobileNumber = req.body.mobileNo;
    let loginUserId;

    //User try to login with email only
    if (userEmail) {
      loginUserId = await isUserExist("email", userEmail);
    } else if (userMobileNumber) {
      loginUserId = await isUserExist("mobileNo", userMobileNumber);
    } else {
      return next(
        createError(
          404,
          "Please Enter email address or mobile number for login!!!"
        )
      );
    }

    const response = await User.doc(loginUserId).get();

    loginUser = { id: loginUserId, ...response.data() };

    //User not found
    if (!loginUser) return next(createError(404, "User not found!"));

    //User available on DB
    const enteredPassword = req.body.password;
    if (!enteredPassword)
      return next(createError(404, "Password must be required!!"));

    const isCorrect = bcrypt.compareSync(enteredPassword, loginUser.password);

    if (!isCorrect) {
      return next(createError(400, "Wrong credentials!!"));
    }

    //CREATE TOKEN FOR LOGIN USER
    const token = jwt.sign(
      {
        id: loginUser.id,
      },
      process.env.JWT,
      {
        expiresIn: "1d",
      }
    );
    //HIDING PASSWORD TO SEND BEFORE USER
    const { password, ...others } = loginUser;
    //SEND THIS TOKEN TO USER
    //Secure way
    res
      .cookie("access_token", token, {
        httpOnly: true, //Third party scripts can't use our cookie
      })
      .status(200)
      .json({ success: true, data: others });
  } catch (error) {
    next(createError(401, "Error occurred!!"));
  }
};

//Check User exist or not
const isUserExist = async (check, value) => {
  let loginUserId;
  const query = User.where(check, "==", value);
  const querySnapshot = await query.get();
  querySnapshot.forEach((doc) => {
    loginUserId = doc.id;
  });

  return loginUserId;
};

module.exports = { signup, signin, isUserExist };
