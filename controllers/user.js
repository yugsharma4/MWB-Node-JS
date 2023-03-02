const { createError } = require("../error");
const { User } = require("../store/config");
const { isUserExist } = require("./auth");

//Get User Data
const getUser = async (req, res, next) => {
  try {
    let id;
    const query = req.query;
    if (query.email) {
      id = await isUserExist("email", query.email);
    } else {
      id = await isUserExist("mobileNo", query.mobileNo);
    }
    if (!id)
      return next(createError(401, "Email or Mobile number is not valid"));

    const response = await User.doc(id).get();
    const user = response.data();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(createError(401, "Error occurred!!"));
  }
};

//Update user
const updateUser = async (req, res, next) => {
  try {
    const query = req.query;

    if (query.email) {
      id = await isUserExist("email", query.email);
    } else {
      id = await isUserExist("mobileNo", query.mobileNo);
    }

    if (!id)
      return next(createError(401, "Email or Mobile number is not valid"));
    //Check token id(req.user.id) is same as login id
    if (req.user.id != id)
      return next(
        createError(
          403,
          "You are not authorized to update your account!!! Please Sign In again!!!"
        )
      );
    //Check profile image provided or not
    if (req.file) {
      const { firebaseUrl } = req.file;
      await User.doc(id).update({ imageUrl: firebaseUrl, ...req.body });
    } else {
      await User.doc(id).update(req.body);
    }

    const updatedUser = await User.doc(id).get();
    res.status(200).json({ success: true, data: [updatedUser.data()] });
  } catch (error) {
    next(createError(401, "Error occurred!!"));
  }
};

//Get All Users
const getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await User.get();
    const responseArr = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: responseArr });
  } catch (error) {
    next(createError(401, "Error occurred!!"));
  }
};

module.exports = { getUser, updateUser, getAllUsers };
