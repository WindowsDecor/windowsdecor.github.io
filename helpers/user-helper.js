var db = require("../config/connection");
var collections = require("../config/collection");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const { resolve } = require("url");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});
module.exports = {
  //==============================User Login Section===========================================================
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let mobileExist = await db.get().collection(collections.USER_COLLECTION).findOne({ mobile: userData.mobile })
      if (mobileExist) {
        resolve({ mobileExist })
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.verify = false
        userData.blockuser = false
        db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
          resolve(data.ops[0]);
        });
      }
    });
  },
  existNumber: (mobile) => {
    return new Promise(async (resolve, reject) => {
      let mobileExist = await db.get().collection(collections.USER_COLLECTION).findOne({
        mobile: mobile
      })
      if (mobileExist) {
        resolve({ mobileExist })
      } else {
        resolve({ mobileExist: false })
      }
    })
  },
  otpsent: (number) => {
    return new Promise(async (resolve, reject) => {
      console.log(number + "....number");
      let otp = Math.floor(100000 + Math.random() * 900000);
      let token = uuidv4();
      let data = await db.get().collection(collections.OTP_COLLECTION).insertOne({ otp, token, number });
      if (data) resolve({ token, otp, number })
      else reject()
    })
  },
  verifyOTP: (otp, id, number, verificationOnly = false) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.OTP_COLLECTION).findOne({ token: id });
      if (!verificationOnly && data) {
        if (data && data.otp == otp && data.number == number) {
          let datanew = await db.get().collection(collections.USER_COLLECTION).findOne({ mobile: number });
          if (datanew) {
            datanew.verify = true
            await db.get().collection(collections.USER_COLLECTION).save(datanew);
          }
          resolve(data);
        }
        else reject();
      }
      else {
        if (data) resolve(data)
        else reject()
      }
    })
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ mobile: userData.mobile });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            if (user.blockuser && user.verify) {
              response.blockuser = true
              resolve(response)
            } else {
              console.log("login successful");
              response.user = user;
              response.status = true;
              resolve(response);
            }
            //console.log(response);
          } else {
            console.log("login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login Failed/user blocked");
        resolve({ status: false });
      }
    });
  },

  //==============================User Login Section===========================================================

  productBasedOnCategory: (categorytName) => {
    return new Promise(async (resolve, reject) => {
      let productBasedOnCategory = await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: categorytName }).toArray()
      resolve(productBasedOnCategory)
    })
  },

  addToCart: (prodid, userid) => {
    let proObj = {
      item: objectId(prodid),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userid) });
      if (userCart) {
        let prodExit = userCart.products.findIndex((products) => products.item == prodid);
        //console.log(prodExit)
        if (prodExit != -1) {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid), "products.item": objectId(prodid) },
            {
              $inc: { "products.$.quantity": 1 },
            }
          ).then(() => {
            resolve();
          });
        } else {
          db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userid) },
            {
              $push: { products: proObj },
            }
          ).then((response) => {
            resolve();
          });
        }
      } else {
        let cartObj = {
          user: objectId(userid),
          products: [proObj],
        };
        db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve();
        });
      }
    });
  },

  getCartProducts: async (userId) => {
    try {
      const cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
        { $match: { user: objectId(userId) } },
        { $unwind: "$products" },
        {
          $project: {
            item: "$products.item",
            quantity: { $toInt: "$products.quantity" }, // Ensure quantity is an integer
          },
        },
        {
          $lookup: {
            from: collections.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            productDetails: { $arrayElemAt: ["$productDetails", 0] },
          },
        },
      ]).toArray();
      return cartItems;
    } catch (error) {
      console.error("Error fetching cart products:", error);
      throw error;
    }
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      console.log(count);

      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        ).then((response) => {
          resolve({ removeProduct: true });
        });
      } else {
        db.get().collection(collections.CART_COLLECTION).updateOne(
          {
            _id: objectId(details.cart),
            "products.item": objectId(details.product),
          },
          {
            $inc: { "products.$.quantity": details.count },
          }
        ).then((response) => {
          resolve({ status: true });
        });
      }
    });
  },

  deleteProductFromCart: (cart, product) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(cart) },
        {
          $pull: {
            products: { item: objectId(product) },
          },
        }
      ).then((response) => {
        resolve();
      });
    });
  },

  getTotalAmount: async (userId) => {
    try {
      const total = await db.get().collection(collections.CART_COLLECTION).aggregate([
        { $match: { user: objectId(userId) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: collections.PRODUCT_COLLECTION,
            localField: "products.item",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  "$products.quantity",
                  { $toDouble: "$productDetails.price" }
                ],
              },
            },
          },
        },
      ]).toArray();
      if (total.length > 0 && total[0].total) {
        return total[0].total;
      } else {
        return { total: false };
      }
    } catch (error) {
      console.error("Error fetching total amount:", error);
      throw error;
    }
  },

  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let orderObj = {
        deliveryDetails: {
          name: order.name,
          mobile: order.mobile,
          save: order.save
        },
        userId: objectId(order._id),
        products: products,
        totalAmount: total,
        date: new Date().toISOString().slice(0, 10),
      };
      db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        let address = {}
        address.useraddress = orderObj.deliveryDetails
        address.userId = orderObj.userId
        if (address.useraddress.save == "on") {
          db.get().collection(collections.ADDRESS_COLLECTION).insertOne(address)
        }
        //console.log(orderObj.deliveryDetails.save)
        db.get().collection(collections.CART_COLLECTION).removeOne({ user: objectId(order._id) });
        resolve(response.ops[0]._id);
      });
    });
  },

  //geting cart db of single user
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      //console.log(userId)
      let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },

  //get  the orders from oder database based on userId
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray().then((response) => {
        //console.log(response)
        resolve(response);
      });
    });
  },

  getProfileDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((profileDetails) => {
        resolve(profileDetails);
      });
    });
  },
  updateProfileDetails: (userId, profiletDetail) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId);
      // console.log(profiletDetail);
      await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
        {
          $set: {
            name: profiletDetail.name,
            email: profiletDetail.email,
            mobile1: profiletDetail.mobile1,
            mobile2: profiletDetail.mobile2,
            city: profiletDetail.city,
            state: profiletDetail.state,
            pincode: profiletDetail.pincode,
            country: profiletDetail.country,
          },
        }
      )
        .then((response) => {
          resolve(response);
        });
    });
  },

  changePassword: (userId, password) => {
    let oldpassword = password.oldpassword;
    let newPassword = password.newpassword;
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) });
      bcrypt.compare(oldpassword, user.password).then(async (status) => {
        if (status) {
          updatedpassword = await bcrypt.hash(newPassword, 10);
          db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
            {
              $set: {
                password: updatedpassword,
              },
            }
          );
          resolve({ status: true });
        } else {
          resolve({ status: false });
        }
      });
    });
  },
  forgotPassword: (userId, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Hash the new password
        const updatedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        const result = await db.get().collection(collections.USER_COLLECTION).updateOne(
          { mobile: userId },
          {
            $set: {
              password: updatedPassword, // Use the hashed password
            },
          }
        );

        if (result.modifiedCount === 1) {
          console.log("Password updated successfully");
          resolve({ status: true });
        } else {
          console.log("No user found with this mobile number");
          resolve({ status: false, message: "No user found with this mobile number" });
        }
      } catch (error) {
        console.error("Error updating password:", error);
        reject({ status: false, message: "An error occurred while updating the password" });
      }
    });
  },


  getUserAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
      resolve(userAddress)
    })
  },

  //Getting user details using mobile numbers 
  getMobileDetails: (mobileNumber) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTION).findOne({ mobile: mobileNumber })
      if (user) {
        resolve(user)
      } else {
        resolve()
      }
    })
  },
  productSearch: (payload) => {
    return new Promise(async (resolve, reject) => {
      console.log(payload)
      let search = await db.get().collection(collections.PRODUCT_COLLECTION).find(
        { name: { $regex: new RegExp(payload + ".*", "i") } }).toArray();
      resolve(search);
    });
  },
  addContact: (contact) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.CONTACT_COLLECTION).insertOne(contact);
      resolve(data.ops[0]._id);
    })
  },
  getBlogDetails: () => {
    return new Promise(async (resolve, reject) => {
      const data = db.get().collection(collections.BLOG_US_COLLECTION).find().toArray()
      if (data) {
        resolve(data)
      }
      else {
        reject("internal server error")
      }
    })

  },
}
