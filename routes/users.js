const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper');
const userHelper = require('../helpers/user-helper');
var UserHelper = require('../helpers/user-helper')
var db = require('../config/connection');
const fs = require('fs'); // Require file system module
const { default: axios } = require('axios');
const { uploadImage ,deleteImage,checkImageExists} = require("../helpers/imageUpload");
//twilio
const accountSid = process.env.accountSid
const authToken = process.env.authToken
const client = require('twilio')(accountSid, authToken);
const verificationToken = process.env.verificationToken;
const fastsmsapi = process.env.FASTSMSAPI;
const fastsmsapikey = process.env.FASTSMSAPIKEY;

//===============================================User Login Section Start Here===================================================================
//Using of midelware
const verifyLogin = (req, res, next) => {
  if (db.get() === null) {
    res.render('user/something-went-wrong')
  }
  if (req.session.logedIn) {
    next();
  } else {
    res.redirect('/login')
  }
}

router.get('/signup', (req, res) => {
  mobileExist = req.session.mobileExist
  res.render('user/signup', { user: true, mobileExist })
  req.session.mobileExist = false
})


router.get('/forgot-password', (req, res) => {
  res.render('user/forgot-password', { user: true });
})

router.post('/forgot-password', (req, res) => {
  const { mobile } = req.body
  if (mobile) {
    userHelper.existNumber(mobile).then((result) => {
      console.log(result);
      if (result) {
        userHelper.otpsent(mobile).then((response) => {
          axios.post(fastsmsapi, {
            "route": "otp",
            "variables_values": `${response.otp}`,
            "numbers": `${response.number}`
          }, {
            headers: {
              'Authorization': fastsmsapikey,
              'Content-Type': 'application/json', // Adjust as needed
              // Add any other headers you need
            }
          })
            .then(verificationResponse => {
              if (verificationResponse.data.return) {
                // OTP verified successfully
                res.render('user/forgot-password-verify', { mobile, otp: response.otp, token: response.token, user: true })
              } else {
                // OTP verification failed
                req.session.loginErr = "OTP verification failed!";
                res.redirect("/");
              }
            })
            .catch(err => {
              console.error("Error verifying OTP:", err);
              req.session.loginErr = "Error verifying OTP!";
              res.redirect("/");
            });
        }).catch((err) => {
          res.render('user/forgot-password', { errNumber: true, user: true });
        })
      }
      else {
        res.render('user/forgot-password', { errNumber: true, user: true });
      }
    })

  }
  else {
    res.render('/forgot-password', { user: true })
  }
})

router.post('/forgot-password-otp', (req, res) => {
  const { mobile, otp, token, newPassword } = req.body
  userHelper.verifyOTP(otp, token, mobile).then((response) => {
    userHelper.forgotPassword(mobile, newPassword).then((response) => {
      res.redirect('/login')
    }).catch((err) => {
      res.render('user/forgot-password-verify', { errOtp: true, user: true })
    })
  })
    .catch((err) => {
      res.render('user/forgot-password-verify', { errOtp: true, user: true })
    })
})

router.post('/signup', (req, res) => {
  const { mobile } = req.body;
  UserHelper.doSignup(req.body).then((response) => {
    //console.log(response.emailExist);
    if (response.mobileExist) {
      console.log("mobile exit")
      req.session.mobileExist = "With this mobile number, an account already exists. For more information, please contact the administrator!";
      res.redirect('/signup')
    } else {

      console.log(req.body.mobile);
      userHelper.otpsent(req.body.mobile).then((response) => {
        axios.post(fastsmsapi, {
          "route": "otp",
          "variables_values": `${response.otp}`,
          "numbers": `${response.number}`
        }, {
          headers: {
            'Authorization': fastsmsapikey, // Replace with your auth token
            'Content-Type': 'application/json', // Adjust as needed
            // Add any other headers you need
          }
        })
          .then(verificationResponse => {
            if (verificationResponse.data.return) {
              // OTP verified successfully
              console.log(response.number);
              res.render("user/otpverification", { token: response.token, otp: response.otp, mobile: response.number });
            } else {
              // OTP verification failed
              req.session.loginErr = "OTP verification failed!";
              res.redirect("/");
            }
          })
          .catch(err => {
            console.error("Error verifying OTP:", err);
            req.session.loginErr = "Error verifying OTP!";
            res.redirect("/");
          });
      }).catch((err) => {
        res.redirect('/')

      })
      // req.session.user = response;
      // req.session.logedIn = true;
    }
  })
})
router.post("/otpverification", (req, res) => {
  const { token, mobile, otp } = req.body;
  adminHelper.verifyOTP(otp, token, mobile).then((response) => {
    if (response) {
      if (mobile === "9946995599") {
        req.session.superadminloggedin = true;
      }
      alert("account created")
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid OTP!!";
      res.redirect(`/`);
    }
  }).catch(() => {
    res.redirect("/");
  })

})


router.get('/login', async (req, res) => {
  let allCategory = await adminHelper.getALLCategory()
  //console.log(req.session.user)
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { user: true, "logedinErr": req.session.logedinErr, blockuser: req.session.blockuser, allCategory })
    req.session.logedinErr = false
    req.session.blockuser = false
  }
})




router.post('/login', (req, res) => {
  UserHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      /* Here we create an session for single user with its all details */
      req.session.user = response.user;
      req.session.logedIn = true;
      res.redirect('/')
    } else {
      if (response.blockuser) {
        req.session.blockuser = response.blockuser
        res.redirect('/login')
      } else {
        req.session.logedinErr = true;
        res.redirect('/login')
      }

    }

  })
})

router.get('/mobile-number', (req, res) => {
  if (req.session.logedIn) {
    res.redirect('/')
  }
  else {
    res.render('user/mobile-number', { user: true, "nouser": req.session.noUser, "accoutBlocked": req.session.accountBlocked })
    req.session.noUser = false
    req.session.accountBlocked = false
  }
})

router.post('/mobile-number', (req, res) => {
  let mobileNo = req.body.mobile
  userHelper.getMobileDetails(mobileNo).then((user) => {
    // console.log(user)
    if (user) {
      if (user.blockuser === false) {
        client.verify.services(verificationToken).verifications.create({
          to: `+91${req.body.mobile}`,
          channel: "sms"
        }).then((resp) => {
          req.session.mobileNumber = resp.to
          res.redirect('/otp-verification')
        }).catch((err) => {
          console.log(err)
        })
      }
      else {
        req.session.accountBlocked = true
        res.redirect('/mobile-number')
        console.log("account is blocked")
      }

    } else {
      req.session.noUser = true
      res.redirect('/mobile-number')
      console.log("No user found111111")
    }

  })
})



router.get('/otp-verification', async (req, res) => {
  if (req.session.logedIn) {
    res.redirect('/')
  } else {
    mobileNumber = req.session.mobileNumber
    res.render('user/otp-verification', { user: true, mobileNumber, "invalidOtp": req.session.invalidOtp })
    req.session.invalidOtp = false

  }
})
router.post('/otp-verification', (req, res) => {
  let otp = req.body.otp
  let number = req.session.mobileNumber
  client.verify
    .services(verificationToken)
    .verificationChecks.create({
      to: number,
      code: otp
    }).then((response) => {
      if (response.valid) {
        number = number.slice(3);
        userHelper.getMobileDetails(number).then(async (user) => {
          req.session.user = user
          req.session.logedIn = true;
          res.redirect('/')
        })
      } else {
        console.log("otp entered is not valid");
        req.session.invalidOtp = true
        res.redirect('/otp-verification')
      }
    }).catch((err) => {
      req.session.invalidOtp = true
      console.log("otp errorrrrr")
      //console.log(err)
      res.redirect('/otp-verification')
    })
})
//=========================
router.get("/change-password", verifyLogin, async (req, res) => {
  let cartCount = null
  let allCategory = await adminHelper.getALLCategory()
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  user_login = req.session.user
  message = req.session.message
  res.render("user/change-password", { user: true, user_login, cartCount, message, allCategory })
  req.session.message = false;
})

router.post("/change-password/:id", verifyLogin, (req, res) => {
  userHelper.changePassword(req.params.id, req.body).then((response) => {
    console.log(response);
    if (response.status) {
      res.redirect("/edit-profile");
    } else {
      req.session.message = "You have entered a wrong password";
      res.redirect("/change-password");
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.logedIn = false;
  res.redirect('/');
})
//=====================================================User Login Section End Here==============================================================
//=====================================================Home Page Start Section==================================================================
router.get('/', async (req, res) => {
  if (db.get() === null) {
    res.render('user/something-went-wrong')
  } else {
    let user_login = req.session.user;
    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    let allCategory = await adminHelper.getALLCategory()
    let banners = await adminHelper.getALLBanners();

    adminHelper.getRandomProducts().then((product) => {
      res.render('user/home', { user: true, user_login, cartCount, product, allCategory, banners })
    })
  }

  // res.render('user/home',{user:true,user_login,cartCount})
})

//=====================================================Home Page End Section==================================================================

router.get('/products-details-category/:categoryName', async (req, res) => {
  if (db.get() === null) {
    res.render('user/something-went-wrong')
  }
  let user_login = req.session.user
  let categoryName = req.params.categoryName
  let allCategory = await adminHelper.getALLCategory()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  productBasedOnCategory = await userHelper.productBasedOnCategory(categoryName)
  res.render('user/category', { user: true, user_login, categoryName, productBasedOnCategory, allCategory, cartCount })
})

router.get('/view-single-product/:id', async (req, res) => {
  let user_login = req.session.user;
  let allCategory = await adminHelper.getALLCategory()
  let cartCount = null

  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }

  adminHelper.getProductDetails(req.params.id).then((product) => {
    adminHelper.getRelatedProducts(product.category).then((relatedProducts) => {
      // Check if images exist
      let firstImageExists = checkImageExists('windows',`images/${req.params.id}first.jpg`);
      let secondImageExists = checkImageExists('windows',`images/${req.params.id}second.jpg`);
      let thirdImageExists = checkImageExists('windows',`.images/${req.params.id}third.jpg`);
      let fourthImageExists = checkImageExists('windows',`images/${req.params.id}fourth.jpg`);
      // Add image existence status to product object
      product.firstImageExists = firstImageExists;
      product.secondImageExists = secondImageExists;
      product.thirdImageExists = thirdImageExists;
      product.fourthImageExists = fourthImageExists;
      res.render('user/single-product-details', { relatedProducts, product, user: true, user_login, cartCount, allCategory });
      req.session.errorMessage = false;
    })
  })

})


//================================================================Cart Section Start Here======================================================
router.get('/cart', verifyLogin, async (req, res) => {
  let user_login = req.session.user;
  let allCategory = await adminHelper.getALLCategory()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  let product_list = await userHelper.getCartProducts(req.session.user._id)
  let totalAmount = 0
  if (product_list.length > 0) {
    totalAmount = await userHelper.getTotalAmount(req.session.user._id)
  }
  if (totalAmount <= 0) {
    res.redirect('/empty-cart')
  }
  res.render('user/cart', { user: true, product_list, user_login, totalAmount, cartCount, allCategory })
})
router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.logedIn) {
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })
    });
  }
  else {
    res.json({ status: false })
    console.log("please login")

  }
})

router.post('/change-product-quantity', (req, res, next) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id)
    res.json(response)
  })
})

router.get("/remove-product-from-cart/:id/:prodId", (req, res, next) => {
  userHelper.deleteProductFromCart(req.params.id, req.params.prodId).then(() => {
    res.redirect('/cart')
  });
});

router.get('/empty-cart', verifyLogin, async (req, res) => {
  let cartCount = 0;
  let allCategory = await adminHelper.getALLCategory()
  let user_login = req.session.user;
  res.render('user/empty-cart', { user: true, user_login, cartCount, allCategory })
})

//================================================================Cart Section End Here======================================================


router.get('/place-order', async (req, res) => {
  let products = await userHelper.getCartProductList(req.session.user._id);
  let totalPrice = await userHelper.getTotalAmount(req.session.user._id);
  await userHelper.placeOrder(req.session.user, products, totalPrice)
  res.redirect('/order-placed-sucessfully')
})

router.get('/order-placed-sucessfully', verifyLogin, async (req, res) => {
  let user_login = req.session.user;
  let allCategory = await adminHelper.getALLCategory()
  let cartCount = 0;
  res.render('user/order-placed-sucessfully', { user: true, user_login, cartCount, allCategory })
})


router.get("/edit-profile", verifyLogin, async (req, res) => {
  user_login = req.session.user
  let allCategory = await adminHelper.getALLCategory()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  userHelper.getProfileDetails(user_login._id).then((profileDetails) => {
    // console.log(profileDetails)
    res.render("user/edit-profile", { user: true, user_login, profileDetails, cartCount, allCategory })
  })
});

router.post("/edit-profile/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Update profile details in the database
    await userHelper.updateProfileDetails(userId, req.body);

    // Check if an image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `profile/${userId}.jpg`; // Store the image in the "profile/" directory with dynamic user ID

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`Profile image for user ID ${userId} uploaded successfully`);
    }

    // Redirect to the home page or any relevant page
    res.redirect("/");
  } catch (err) {
    console.error("Error updating profile details or uploading image:", err);

    // Redirect to an error page or handle the error appropriately
    res.redirect("/error");
  }
});



router.post("/getSearchProduct", async (req, res) => {
  let payload = req.body.payload.trim();
  userHelper.productSearch(payload).then((search) => {
    res.send({ payload: search });
  });
});

//==============================================
router.get('/about', async (req, res) => {
  let aboutUs = await adminHelper.getALLAboutUsDetails();
  let branch = await adminHelper.getALLBranchDetails();
  let allCategory = await adminHelper.getALLCategory()
  res.render('user/about', { user: true, aboutUs, branch, allCategory })
})

// router.post('/add-contact', function(req, res) {
//   userHelper.addContact(req.body).then((id) => {
//       res.redirect('/about');
//   }).catch((err) => {
//       console.error("Error in adding contact Details:", err);
//       res.redirect('/about'); 
//   });
// });

router.post('/add-contact', function (req, res) {

  req.session.body = req.body
  // Send OTP via Twilio
  // client.verify.services(verificationToken)
  //   .verifications
  //   .create({
  //     to: `+91${req.body.mobile}`,
  //     channel: "sms"
  //   })
  //   .then((resp) => {
  //     req.session.mobileNumber = resp.to
  //     res.redirect('/otp-verification-contact');
  //   })
  //   .catch((err) => {
  //     console.error("Error sending OTP:", err);
  //     contactMessageOtpError();
  //     res.redirect('/about');
  //   });
  userHelper.otpsent(req.body.mobile).then((response) => {
    req.session.mobileNumber = response.number;
    req.session.token = response.token;
    axios.post(fastsmsapi, {
      "route": "otp",
      "variables_values": `${response.otp}`,
      "numbers": `${response.number}`
    }, {
      headers: {
        'Authorization': fastsmsapikey,
        'Content-Type': 'application/json', // Adjust as needed
        // Add any other headers you need
      }
    })
      .then(verificationResponse => {
        if (verificationResponse.data.return) {
          // OTP verified successfully
          res.redirect('/otp-verification-contact')
        } else {
          // OTP verification failed
          req.session.loginErr = "Invalid Number";
          res.redirect("/");
        }
      })
      .catch(err => {
        console.error("Error verifying OTP:", err);
        req.session.loginErr = "Invalid Number!";
        res.redirect("/");
      });
  })
});


router.get('/otp-verification-contact', async (req, res) => {
  // Retrieve mobile number from session
  let mobileNumber = req.session.mobileNumber;

  // Render OTP verification page
  res.render('user/otp-verification-contact', { user: true, mobileNumber, invalidOtp: req.session.invalidOtp });

  // Reset invalidOtp session variable after rendering the page
  req.session.invalidOtp = false;
});

router.post('/otp-verification-contact', (req, res) => {
  let otp = req.body.otp;
  let number = req.session.mobileNumber;
  let token = req.session.token;
  let body = req.session.body;
  // otp verification
  userHelper.verifyOTP(otp, token, number).then((response) => {
    userHelper.addContact(body).then((id) => {
      // Clear mobileNumber from session after successful addition
      req.session.mobileNumber = null; // Reset mobileNumber in session
      req.req.session.body = null // Reset body in session
      res.redirect('/about');
    }).catch((err) => {
      console.error("Error in adding contact Details:", err);
      res.redirect('/about');
    });
  }).catch((err) => {
    console.error("Error in verifying OTP:", err);
    req.session.invalidOtp = true;
    res.redirect('/otp-verification-contact');
  })
});

router.get('/blogpage', (req, res) => {
  userHelper.getBlogDetails().then((response) => {
    console.log(response);
    res.render('user/blogpage', { blogDetails: response, user: true });
  }).catch((err) => {
    console.error("Error getting blog details:", err);
    res.redirect('/'); // or handle error appropriately
  });
})



module.exports = router;
