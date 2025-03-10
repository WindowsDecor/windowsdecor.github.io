var express = require('express');
var router = express.Router();
const adminHelper = require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper');
const fs = require('fs');
var db = require('../config/connection');
const { default: axios } = require('axios');
const { uploadImage ,deleteImage} = require("../helpers/imageUpload");
const nodemailer = require('nodemailer');

//twilio
const accountSid = process.env.accountSid
const authToken = process.env.authToken
const messagingSid = process.env.messagingSid
const client = require('twilio')(accountSid, authToken);
const fastsmsapi = process.env.FASTSMSAPI;
const fastsmsapikey = process.env.FASTSMSAPIKEY;

const verifyLogin = (req, res, next) => {
  if (db.get() === null) {
    res.render('user/something-went-wrong')
  }
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
}


/**Admin login section  */
router.get("/", async (req, res) => {
  let admin = req.session.adminloggedIn;
  if (admin) {
    let paymentMethod = await adminHelper.paymentMethods();
    let orderStatus = await adminHelper.OrderStatus();
    let FoodItemCount = await adminHelper.getFoodItemCount();
    let UserCount = await adminHelper.getUserCount();
    let profit = await adminHelper.getProfit();
    let delivredCount = await adminHelper.getDeliveredCount()
    res.render('admin/dashboard', { admin: true, UserCount, profit, orderStatus, paymentMethod, FoodItemCount, delivredCount })
  } else {
    res.render("admin/adminlogin", { loginErr: req.session.loginErr });
    // res.render("admin/otpverification",{token:"f5b8550a-95c2-48e2-b42a-d4e43b7246a8",otp:"",mobile:"1234567890"});
    req.session.loginErr = false;
  }
});


// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider
  auth: {
    user: 'windowsdecor1@gmail.com', // Replace with your email
    pass: 'xjaz lykx ercp mhjz'   // Use App Passwords if using Gmail
  }
});

router.post("/", (req, res) => {
  adminHelper.doLogin(req.body).then((responsem) => {
    if (responsem.status) {
      adminHelper.otpsent(responsem.email).then((response) => {
        
        // Email content
        const mailOptions = {
          from: 'your-email@gmail.com',
          to: responsem.email, // Send OTP to email instead of mobile
          subject: 'Your OTP Code',
          text: `Your OTP code is: ${response.otp}`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending OTP email:", error);
            req.session.loginErr = "Error sending OTP!";
            return res.redirect("/admin");
          }

          console.log(`OTP sent to ${responsem.email}`);
          res.render("admin/otpverification", { token: response.token, otp: response.otp, email: responsem.email });
        });
      });
    } else {
      req.session.loginErr = "Invalid Username or Password!!";
      res.redirect("/admin");
    }
  });
});


// Verify OTP
router.post("/otpverification", (req, res) => {
  const { token, email, otp } = req.body;
  
  adminHelper.verifyOTP(otp, token, email).then((response) => {
    if (response) {
      if (email === "windowscallcenter@gmail.com") {
        req.session.superadminloggedin = true;
        req.session.superadmin = true;
      }
      req.session.adminloggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = "Invalid OTP!!";
      res.redirect(`/admin`);
    }
  }).catch(() => {
    res.redirect("/admin");
  });
});



router.get("/adminlogout", (req, res) => {
  req.session.admin = null;
  req.session.adminloggedIn = false;
  res.redirect("/admin");
});
/**Admin login section end here */

/**Admin Banner section  */
router.get('/banner', verifyLogin, async (req, res) => {
  let banners = await adminHelper.getALLBanners();
  res.render('admin/banner', { admin: true, banners });
});

router.post('/banner', (req, res) => {
  adminHelper.addBannerDetails(req.body).then(async(id) => {
    if (req.files && req.files.image) {
      const image = req.files.image;
     // Create a readable stream from the uploaded image
     const fileStream = image.data;

     // Upload the image to Sufy bucket with key `banner/{id}.jpg`
     const bucketName = "windows"; // Replace with your bucket name
     const keyName = `banner/${id}.jpg`; // Dynamic key with banner ID

     await uploadImage(fileStream, bucketName, keyName);
    } else {
      console.log("No image uploaded");
    }

    console.log("Banner details added successfully");
    res.redirect('/admin/banner');
  });
});


router.get('/activate-banner/:id', verifyLogin, (req, res) => {
  let bannerId = req.params.id;
  adminHelper.activateBanner(bannerId).then(() => {
    res.redirect('/admin/banner');
  }).catch((err) => {
    console.error("Error activating banner:", err);
    res.redirect('/admin/banner'); // or handle error appropriately
  });
});


router.get("/delete-banner/:id", verifyLogin, async (req, res) => {
  const bannerId = req.params.id;
  const bucketName = "windows"; // Replace with your bucket name
  const keyName = `banner/${bannerId}.jpg`; // Path to the image in the bucket

  try {
    // Delete the banner details from the database
    await adminHelper.deleteBanner(bannerId);

    // Delete the image from the S3 bucket
    await deleteImage(bucketName, keyName);

    console.log(`Banner ID ${bannerId} and associated image deleted successfully`);
    res.redirect("/admin/banner");
  } catch (err) {
    console.error("Error deleting banner or image:", err);

    // Handle the error appropriately
    res.redirect("/admin/banner");
  }
});


router.get('/edit-banner/:id', verifyLogin, async (req, res) => {
  try {
    let bannerDetail = await adminHelper.getBannerDetails(req.params.id);
    res.render('admin/edit-banner', { admin: true, bannerDetail });
  } catch (err) {
    console.error("Error fetching banner details:", err);
    res.redirect('/admin/banner'); // or handle error appropriately
  }
});


router.post("/edit-banner/:id", async (req, res) => {
  const bannerId = req.params.id;

  try {
    // Update banner details
    await adminHelper.updateBannerDetails(bannerId, req.body);

    // Check if image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `banner/${bannerId}.jpg`; // Dynamic key for the banner image

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`Banner image for ID ${bannerId} uploaded successfully`);
    }

    // Redirect to banner page
    res.redirect("/admin/banner");
  } catch (err) {
    console.error("Error updating banner details or uploading image:", err);

    // Redirect back to the banner page or handle error appropriately
    res.redirect("/admin/banner");
  }
});




/**Admin Banner section End here */

/**Admin About section  */
router.get('/aboutUs', verifyLogin, async (req, res) => {
  try {
    let aboutUsDetails = await adminHelper.getALLAboutUsDetails();
    res.render('admin/aboutUs', { admin: true, aboutUsDetails });
  } catch (err) {
    console.error("Error fetching about us details:", err);
    res.redirect('/admin/aboutUs'); // or handle error appropriately
  }
});

router.post('/aboutUs', (req, res) => {
  adminHelper.addBannerDetails(req.body).then(async(id) => {
    if (req.files && req.files.image) {
      const image = req.files.image;
     // Create a readable stream from the uploaded image
     const fileStream = image.data;

     // Upload the image to Sufy bucket with key `banner/{id}.jpg`
     const bucketName = "windows"; // Replace with your bucket name
     const keyName = `aboutUs/${id}.jpg`; // Dynamic key with banner ID

     await uploadImage(fileStream, bucketName, keyName);
    } else {
      console.log("No image uploaded");
    }

    console.log("aboutUs details added successfully");
    res.redirect('/admin/aboutUs');
  }).catch((err) => {
    console.error("Error adding about us details:", err);
    res.redirect('/admin/aboutUs'); // or handle error appropriately
  });
  });


 

router.get('/activate-aboutUs/:id', verifyLogin, (req, res) => {
  let aboutUsId = req.params.id;
  adminHelper.activateAboutUs(aboutUsId).then(() => {
    res.redirect('/admin/aboutUs');
  }).catch((err) => {
    console.error("Error activating about us:", err);
    res.redirect('/admin/aboutUs'); // or handle error appropriately
  });
});

// Route to delete aboutUs item
router.get("/delete-aboutUs/:id", verifyLogin, async (req, res) => {
  const aboutUsId = req.params.id;
  const bucketName = "windows"; // Replace with your bucket name
  const keyName = `aboutUs/${aboutUsId}.jpg`; // Path to the image in the bucket

  try {
    // Delete the aboutUs details from the database
    await adminHelper.deleteAboutUs(aboutUsId);

    // Delete the image from the S3 bucket
    await deleteImage(bucketName, keyName);

    console.log(`AboutUs ID ${aboutUsId} and associated image deleted successfully`);
    res.redirect("/admin/aboutUs");
  } catch (err) {
    console.error("Error deleting aboutUs or image:", err);

    // Handle the error appropriately
    res.redirect("/admin/aboutUs");
  }
});

router.get('/edit-aboutUs/:id', verifyLogin, async (req, res) => {
  try {
    let aboutUsDetail = await adminHelper.getAboutUsDetails(req.params.id);
    res.render('admin/edit-aboutUs', { admin: true, aboutUsDetail });
  } catch (err) {
    console.error("Error fetching about us details for editing:", err);
    res.redirect('/admin/aboutUs'); // or handle error appropriately
  }
});

router.post("/edit-aboutUs/:id", async (req, res) => {
  const aboutUsId = req.params.id;

  try {
    // Update banner details
    await adminHelper.updateAboutUsDetails(aboutUsId, req.body);

    // Check if image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `aboutUs/${aboutUsId}.jpg`; // Dynamic key for the banner image

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`aboutUs image for ID ${aboutUsId} uploaded successfully`);
    }

    // Redirect to banner page
    res.redirect("/admin/aboutUs");
  } catch (err) {
    console.error("Error updating aboutUs details or uploading image:", err);

    // Redirect back to the banner page or handle error appropriately
    res.redirect("/admin/aboutUs");
  }
});


/**Admin About section End here */

/**Admin Branch section  */
router.get('/branch', verifyLogin, async (req, res) => {
  try {
    let branchDetails = await adminHelper.getALLBranchDetails();
    res.render('admin/branch', { admin: true, branchDetails });
  } catch (err) {
    console.error("Error fetching branch details:", err);
    res.redirect('/admin/branch'); // or handle error appropriately
  }
});

router.post('/branch', (req, res) => {
  adminHelper.addBannerDetails(req.body).then(async(id) => {
    if (req.files && req.files.image) {
      const image = req.files.image;
     // Create a readable stream from the uploaded image
     const fileStream = image.data;

     // Upload the image to Sufy bucket with key `banner/{id}.jpg`
     const bucketName = "windows"; // Replace with your bucket name
     const keyName = `branch/${id}.jpg`; // Dynamic key with banner ID

     await uploadImage(fileStream, bucketName, keyName);
    } else {
      console.log("No image uploaded");
    }

    console.log("branch details added successfully");
    res.redirect('/admin/branch');
      }).catch((err) => {
    console.error("Error adding branch:", err);
    res.redirect('/admin/branch'); // or handle error appropriately
  });
});

// Route to delete branch and associated image
router.get("/delete-branch/:id", verifyLogin, async (req, res) => {
  const branchId = req.params.id;
  const bucketName = "windows"; // Replace with your bucket name
  const keyName = `branch/${branchId}.jpg`; // Path to the image in the bucket

  try {
    // Delete the branch details from the database
    await adminHelper.deleteBranch(branchId);

    // Delete the image from the S3 bucket
    await deleteImage(bucketName, keyName);

    console.log(`Branch ID ${branchId} and associated image deleted successfully`);
    res.redirect("/admin/branch");
  } catch (err) {
    console.error("Error deleting branch or image:", err);

    // Handle the error appropriately
    res.redirect("/admin/branch");
  }
});

router.get('/edit-branch/:id', verifyLogin, async (req, res) => {
  try {
    let branchDetail = await adminHelper.getBranchDetails(req.params.id);
    res.render('admin/edit-branch', { admin: true, branchDetail });
  } catch (err) {
    console.error("Error fetching branch details for editing:", err);
    res.redirect('/admin/branch'); // or handle error appropriately
  }
});

router.post("/edit-branch/:id", async (req, res) => {
  const branchId = req.params.id;

  try {
    // Update banner details
    await adminHelper.updateBranchDetails(branchId, req.body);

    // Check if image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `branch/${branchId}.jpg`; // Dynamic key for the banner image

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`branch image for ID ${branchId} uploaded successfully`);
    }

    // Redirect to banner page
    res.redirect("/admin/branch");
  } catch (err) {
    console.error("Error updating branch details or uploading image:", err);

    // Redirect back to the banner page or handle error appropriately
    res.redirect("/admin/branch");
  }
});

/**Admin Branch section End here */


/**Admin Category section  */
router.get('/add-category', verifyLogin, async (req, res) => {
  try {
    let allCategory = await adminHelper.getALLCategory();
    res.render('admin/add-category', { admin: true, allCategory });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.redirect('/admin/add-category'); // or handle error appropriately
  }
});

router.post('/add-category', (req, res) => {
  adminHelper.addBannerDetails(req.body).then(async(id) => {
    if (req.files && req.files.image) {
      const image = req.files.image;
     // Create a readable stream from the uploaded image
     const fileStream = image.data;

     // Upload the image to Sufy bucket with key `banner/{id}.jpg`
     const bucketName = "windows"; // Replace with your bucket name
     const keyName = `category/${id}.jpg`; // Dynamic key with banner ID

     await uploadImage(fileStream, bucketName, keyName);
    } else {
      console.log("No image uploaded");
    }

    console.log("category details added successfully");
    res.redirect('/admin/category');
      }).catch((err) => {
    console.error("Error adding category:", err);
    res.redirect('/admin/add-category'); // or handle error appropriately
  });
});


router.get('/delete-category/:id', verifyLogin, async (req, res) => {
  const categoryId = req.params.id;
  const bucketName = "windows"; // Replace with your bucket name
  const keyName = `category/${categoryId}.jpg`; // Path to the image in the bucket

  try {
    // Delete the category from the database
    await adminHelper.deleteCategory(categoryId);

    // Delete the image from the S3 bucket
    await deleteImage(bucketName, keyName); // Assume deleteImage function is defined

    console.log(`Category ID ${categoryId} and associated image deleted successfully`);
    res.redirect('/admin/add-category');
  } catch (err) {
    console.error("Error deleting category or image:", err);
    res.redirect('/admin/add-category'); // Handle the error appropriately
  }
});

router.get('/edit-category/:id', verifyLogin, async (req, res) => {
  try {
    let category = await adminHelper.getCategorytDetails(req.params.id);
    res.render('admin/edit-category', { category, admin: true });
  } catch (err) {
    console.error("Error fetching category details for editing:", err);
    res.redirect('/admin/add-category'); // or handle error appropriately
  }
});

router.post("/edit-category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Update banner details
    await adminHelper.updateCategory(categoryId, req.body);

    // Check if image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `category/${categoryId}.jpg`; // Dynamic key for the banner image

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`category image for ID ${categoryId} uploaded successfully`);
    }

    // Redirect to banner page
    res.redirect("/admin/category");
  } catch (err) {
    console.error("Error updating category details or uploading image:", err);

    // Redirect back to the banner page or handle error appropriately
    res.redirect("/admin/category");
  }
});


/**Admin Category section End  */

/**Admin product section  */
router.get('/add-product', verifyLogin, async function (req, res) {
  try {
    let allCategory = await adminHelper.getALLCategory();
    if (!allCategory) {
      console.log("Categories not found");
    }
    res.render('admin/add-product', { admin: true, allCategory });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.redirect('/admin/add-product');
  }
});

router.get('/old-balance', async function (req, res) {
  // console.log()
  let user = req.query.id;
  console.log(req.query.id);
  try {
    let oldbalance = await adminHelper.getOldBalance(user);
    if (!oldbalance) {
      console.log('user not found')
      res.status(400).json({ msg: "user not found" })
    }
    res.json(oldbalance)
  }
  catch (err) {
    res.status(400).json({ msg: 'internal server error' })
  }

});


router.post("/add-product", async function (req, res) {
  try {
    // Add product details and get the generated ID
    const id = await adminHelper.addProduct(req.body);

    if (req.files) {
      const bucketName = "windows"; // Replace with your bucket name

      // Upload image1
      if (req.files.image1) {
        const image1Stream = req.files.image1.data;
        const image1Key = `images/${id}first.jpg`; // Dynamic key for image1
        await uploadImage(image1Stream, bucketName, image1Key);
      }

      // Upload image2
      if (req.files.image2) {
        const image2Stream = req.files.image2.data;
        const image2Key = `images/${id}second.jpg`; // Dynamic key for image2
        await uploadImage(image2Stream, bucketName, image2Key);
      }

      // Upload image3
      if (req.files.image3) {
        const image3Stream = req.files.image3.data;
        const image3Key = `images/${id}third.jpg`; // Dynamic key for image3
        await uploadImage(image3Stream, bucketName, image3Key);
      }

      // Upload image4
      if (req.files.image4) {
        const image4Stream = req.files.image4.data;
        const image4Key = `images/${id}fourth.jpg`; // Dynamic key for image4
        await uploadImage(image4Stream, bucketName, image4Key);
      }
    }

    console.log("Product and images added successfully");
    res.redirect("/admin/add-product");
  } catch (err) {
    console.error("Error adding product or uploading images:", err);
    res.status(500).send("Failed to add product or upload images");
  }
});



router.get("/all-products", verifyLogin, async (req, res) => {
  try {
    const products = await adminHelper.getALLProducts();
    res.render('admin/all-products', { products, admin: true });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.redirect('/admin/all-products');
  }
});


router.get('/delete-product/:id', verifyLogin, async (req, res) => {
  let proId = req.params.id;

  try {
    // Delete the product from the database
    await adminHelper.deleteProduct(proId);

    // Array of image keys to delete
    const imageKeys = [
      `images/${proId}first.jpg`,
      `images/${proId}second.jpg`,
      `images/${proId}third.jpg`,
      `images/${proId}fourth.jpg`,
    ];

    // Iterate over the image keys and delete each one
    for (const key of imageKeys) {
      try {
        await deleteImage(key, 'windows'); // Replace with your bucket name
        console.log(`Deleted image: ${key}`);
      } catch (err) {
        if (err.code === 'NoSuchKey') {
          console.warn(`Image not found: ${key}`);
        } else {
          console.error(`Error deleting image: ${key}`, err);
        }
      }
    }

    // Redirect to the products page
    res.redirect('/admin/all-products');
  } catch (err) {
    console.error('Error deleting product or images:', err);
    res.redirect('/admin/all-products');
  }
});


router.get('/edit-product/:id', verifyLogin, async (req, res) => {
  allCategory = await adminHelper.getALLCategory()
  adminHelper.getProductDetails(req.params.id).then((product) => {
    res.render('admin/edit-product', { product, admin: true, allCategory });
  })
})

router.post("/edit-product/:id", async (req, res) => {
  try {
    // Update product details
    await adminHelper.updateProduct(req.params.id, req.body);

    if (req.files) {
      const bucketName = "windows"; // Replace with your bucket name
      const productId = req.params.id;

      // Check and upload image1
      if (req.files.image1) {
        const image1Stream = req.files.image1.data;
        const image1Key = `images/${productId}first.jpg`;
        await uploadImage(image1Stream, bucketName, image1Key);
        console.log("Image 1 uploaded successfully");
      }

      // Check and upload image2
      if (req.files.image2) {
        const image2Stream = req.files.image2.data;
        const image2Key = `images/${productId}second.jpg`;
        await uploadImage(image2Stream, bucketName, image2Key);
        console.log("Image 2 uploaded successfully");
      }

      // Check and upload image3
      if (req.files.image3) {
        const image3Stream = req.files.image3.data;
        const image3Key = `images/${productId}third.jpg`;
        await uploadImage(image3Stream, bucketName, image3Key);
        console.log("Image 3 uploaded successfully");
      }

      // Check and upload image4
      if (req.files.image4) {
        const image4Stream = req.files.image4.data;
        const image4Key = `images/${productId}fourth.jpg`;
        await uploadImage(image4Stream, bucketName, image4Key);
        console.log("Image 4 uploaded successfully");
      }
    }

    // Redirect to the all-products page
    res.redirect("/admin/all-products");
  } catch (err) {
    console.error("Error updating product or uploading images:", err);

    // Redirect back to the all-products page or handle the error appropriately
    res.redirect("/admin/all-products");
  }
});

/**Admin Product section End */



/**Admin Customer section  */
router.get("/all-customers", verifyLogin, async (req, res) => {
  adminHelper.getALLCustomers().then((customers) => {
    res.render('admin/all-customers', { customers, admin: true })
  })
});

router.get('/add-customer', verifyLogin, async function (req, res) {
  adminHelper.getALLBranchDetails().then((list) => {
    console.log(list)
    res.render('admin/add-customer', { list, admin: true })
  })


  router.post('/add-customer', function (req, res) {
    adminHelper.addCustomer(req.body).then((id) => {
      res.redirect('/admin/all-customers');
    }).catch((err) => {
      console.error("Error adding product:", err);
      res.redirect('/admin/add-customer');
    });
  });
})


router.get('/delete-customer/:id', async (req, res) => {
  let customerId = req.params.id;

  try {
    // Ensure product exists before attempting to delete
    const customer = await adminHelper.deleteCustomer(customerId);
    if (!customer) {
      res.redirect('/admin/all-customers');
    }

    res.redirect('/admin/all-customers');
  } catch (error) {
    res.redirect('/admin/all-customers');
  }
});

router.get('/edit-customer/:id', verifyLogin, async (req, res) => {
  adminHelper.getCustomertDetails(req.params.id).then((customer) => {
    res.render('admin/edit-customer', { customer, admin: true });
  })
})

router.post('/edit-customer/:id', (req, res) => {
  adminHelper.updateCustomerDetails(req.params.id, req.body).then((response) => {
    res.redirect('/admin/all-customers');
  }).catch((err) => {
    console.error(err);
    res.redirect('/admin/all-customers'); // Handle errors appropriately
  });
});


/**Admin Customer section End */

/**Admin credit book section  */
router.get("/all-credit-books", verifyLogin, async (req, res) => {
  adminHelper.getALLCreditBooks().then((creditBooks) => {
    res.render('admin/all-credit-books', { creditBooks, admin: true })
  })
});

router.get('/add-credit-book', verifyLogin, async function (req, res) {
  adminHelper.getallEmployeeDetails().then((customers) => {
    console.log(customers);
    res.render('admin/add-credit-book', { customers, admin: true })
  })
    .catch((err) => {
      console.log(err);
      // res.render('admin/add',{admin:true})
    })
})
router.post('/add-credit-book', function (req, res) {
  adminHelper.addCreditBook(req.body).then(({ status }) => {
    res.redirect(`/admin/all-credit-books/${status._id}`);
  }).catch((err) => {
    console.error("Error adding credit book:", err);
    res.redirect('/admin');
  });
});


router.get('/delete-credit-book/:id', async (req, res) => {
  let creditBookId = req.params.id;

  try {
    // Ensure product exists before attempting to delete
    const creditBook = await adminHelper.deleteCreditBook(creditBookId);
    if (!creditBook) {
      res.redirect('/admin/all-credit-books');
    }
    res.redirect('/admin/all-credit-books');
  } catch (error) {
    res.redirect('/admin/all-credit-books');
  }
});

router.get('/edit-credit-book/:id', verifyLogin, async (req, res) => {
  adminHelper.getCreditBookDetails(req.params.id).then((creditBook) => {
    res.render('admin/edit-credit-book', { creditBook, admin: true });
  })
})

router.post('/edit-credit-book/:id', (req, res) => {
  adminHelper.updateCreditBookDetails(req.params.id, req.body).then((response) => {
    res.redirect('/admin/all-credit-books');
  }).catch((err) => {
    console.error(err);
    res.redirect('/admin/all-credit-books');
  });
});
/**Admin credit book section End */

/**Admin Dealer details section  */
router.get("/all-dealer-details", verifyLogin, async (req, res) => {
  adminHelper.getALLDealerDetails().then((dealerDetails) => {
    let details = []
    dealerDetails.map((item) => {
      details.push({ ...item, payableAmount: Number(item.totalAmount) + Number(item.oldBalance) })
    })
    //  const Details = {...dealerDetails , payableAmount : dealerDetails.totalAmount + dealerDetails.oldBalance}
    console.log(details);

    console.log(details);

    res.render('admin/all-dealer-details', { dealerDetails: details, admin: true })
  })
});

router.get('/add-dealer-detail', verifyLogin, async function (req, res) {
  res.render('admin/add-dealer-detail', { admin: true })


  router.post('/add-dealer-detail', function (req, res) {
    adminHelper.addDealerDetail(req.body).then((id) => {
      res.redirect('/admin/all-dealer-details');
    }).catch((err) => {
      console.error("Error adding dealer details:", err);
      res.redirect('/admin/all-dealer-details');
    });
  });
})


router.get('/delete-dealer-details/:id', async (req, res) => {
  let dealerDetailsId = req.params.id;

  try {
    // Ensure product exists before attempting to delete
    const dealerDetail = await adminHelper.deleteDealerDetail(dealerDetailsId);
    if (!creditBook) {
      res.redirect('/admin/all-dealer-details');
    }

    res.redirect('/admin/all-dealer-details');
  } catch (error) {
    res.redirect('/admin/all-dealer-details');
  }
});

router.get('/edit-dealer-detail/:id', verifyLogin, async (req, res) => {
  adminHelper.getDealerDetail(req.params.id).then((dealerDetail) => {
    res.render('admin/edit-dealer-detail', { dealerDetail, admin: true });
  })
})

router.post('/edit-dealer-detail/:id', (req, res) => {
  console.log(req.body)
  adminHelper.updateDealerDetail(req.params.id, req.body).then((response) => {
    res.redirect('/admin/all-dealer-details')
  }).catch((err) => {
    console.error(err);
    res.redirect('/admin/all-dealer-details')
  });
});
/**Admin Dealer section End */

/**Admin monthly square feet details section  */
router.get("/all-monthly-square-feet", verifyLogin, async (req, res) => {
  adminHelper.getALLMonthlySquareFeet().then((monthlySquareFeet) => {
    res.render('admin/all-monthly-square-feet', { monthlySquareFeet, admin: true })
  })
});
router.get("/all-monthly-square-feet/:type", verifyLogin, async (req, res) => {
  const type = req.params.type
  adminHelper.getSingleMonthlySquareFeet(type).then((monthlySquareFeet) => {
    console.log(monthlySquareFeet);

    res.render('admin/all-monthly-square-feet', { monthlySquareFeet, admin: true })
  })
});

router.get('/add-monthly-square-feet', verifyLogin, async function (req, res) {
  res.render('admin/add-monthly-square-feet', { admin: true })


  router.post('/add-monthly-square-feet', function (req, res) {
    adminHelper.addMonthlySquareFeet(req.body).then((id) => {
      res.redirect('/admin/all-monthly-square-feet');
    }).catch((err) => {
      console.error("Error adding Monthly Square Feet:", err);
      res.redirect('/admin/all-monthly-square-feet');
    });
  });
})


router.get('/delete-monthly-square-feet/:id', async (req, res) => {
  let monthlySquareFeetId = req.params.id;

  try {
    // Ensure product exists before attempting to delete
    const dealerDetail = await adminHelper.deleteMonthlySquareFeet(monthlySquareFeetId);
    if (!dealerDetail) {
      res.redirect('/admin/all-monthly-square-feet');
    }

    res.redirect('/admin/all-monthly-square-feet');
  } catch (error) {
    res.redirect('/admin/all-monthly-square-feet');
  }
});

router.get('/edit-monthly-square-feet/:id', verifyLogin, async (req, res) => {
  adminHelper.getMonthlySquareFeet(req.params.id).then((monthlySquareFeet) => {
    res.render('admin/edit-monthly-square-feet', { monthlySquareFeet, admin: true });
  })
})

router.post('/edit-monthly-square-feet/:id', (req, res) => {
  adminHelper.updateMonthlySquareFeet(req.params.id, req.body).then((response) => {
    const type = req.body.productType
    console.log(req.body);

    if (type === "Windows") res.redirect('/admin/all-monthly-square-feet/Windows');
    else res.redirect('/admin/all-monthly-square-feet/JD');
  }).catch((err) => {
    console.error(err);
    res.redirect('/admin/all-monthly-square-feet');
  });
});
/**Admin monthly square feet section End */

/**Admin Contacted section Start */
router.get("/all-contacts", verifyLogin, async (req, res) => {
  adminHelper.getALLContacts().then((contacts) => {
    res.render('admin/all-contacts', { contacts, admin: true })
  })
});

router.get('/delete-contact/:id', async (req, res) => {
  let contactId = req.params.id;

  try {
    // Ensure product exists before attempting to delete
    const contact = await adminHelper.deleteContact(contactId);
    if (!contact) {
      res.redirect('/admin/all-contacts');
    }

    res.redirect('/admin/all-contacts');
  } catch (error) {
    res.redirect('/admin/all-contacts');
  }
});

/**Admin Contacted section End */

/**Admin Cart section Start */
router.get('/view-carts', verifyLogin, async (req, res) => {
  carts = await adminHelper.getALLCarts()
  res.render('admin/view-carts', { carts, admin: true })
})
router.get('/view-cart-items/:id', verifyLogin, async (req, res) => {
  cartProductDetails = await adminHelper.getOrderproduct(req.params.id);
  res.render('admin/view-cart-items', { admin: true, cartProductDetails })
})

router.get('/delete-product-cart/:id', verifyLogin, (req, res) => {
  let cartId = req.params.id;
  adminHelper.deleteCart(orderId).then(() => {
    res.redirect('/admin/view-carts');
  }).catch((err) => {
    console.error("Error deleting orders:", err);
    res.redirect('/admin/view-carts'); // or handle error appropriately
  });
});
/**Admin Cart section End */

//====================================================================================================

router.get('/users-list', verifyLogin, async (req, res) => {
  userlist = await adminHelper.getALLusers()
  res.render('admin/users-list', { userlist, admin: true })
})

router.get('/delete-user/:id', verifyLogin, async (req, res) => {
  let userId = req.params.id;

  try {
    // Delete user from the database
    await adminHelper.deleteUser(userId);

    const imageKey = `profile/${userId}.jpg`; // Image key to be deleted

    // Delete the user's profile image from the S3 bucket
    try {
      await deleteImage(imageKey, 'windows'); // Replace with your actual bucket name
      console.log(`Successfully deleted image: ${imageKey}`);
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        console.warn(`Image not found: ${imageKey}`);
      } else {
        console.error(`Error deleting image: ${imageKey}`, err);
      }
    }

    // Redirect to the users list page
    res.redirect('/admin/users-list');
  } catch (err) {
    console.error('Error deleting user or image:', err);
    res.redirect('/admin/users-list');
  }
});


router.get('/block-user/:id', (req, res) => {
  userId = req.params.id
  adminHelper.blockUser(userId).then(() => {
    res.redirect('/admin/users-list')
  })
})
router.get('/unblock-user/:id', (req, res) => {
  userId = req.params.id
  adminHelper.unblockUser(userId).then(() => {
    res.redirect('/admin/users-list')
  })
})

router.get('/view-orders', verifyLogin, async (req, res) => {
  orders = await adminHelper.getALLOrders()
  res.render('admin/view-orders', { orders, admin: true })
})
router.get('/view-order-items/:id', verifyLogin, async (req, res) => {
  orderProductDetails = await adminHelper.getOrderproduct(req.params.id);
  res.render('admin/view-order-items', { admin: true, orderProductDetails })
})

router.get('/delete-order/:id', verifyLogin, (req, res) => {
  let orderId = req.params.id;
  adminHelper.deleteOrder(orderId).then(() => {
    res.redirect('/admin/view-orders');
  }).catch((err) => {
    console.error("Error deleting orders:", err);
    res.redirect('/admin/view-orders'); // or handle error appropriately
  });
});


router.get('/employe', verifyLogin, (req, res) => {
  console.log(req.session.superadminloggedin ?? false);
  adminHelper.getallEmployeeDetails().then((creditBooks) => {
    res.render('admin/all-employee', { creditBooks, admin: true, superadmin: req.session.superadminloggedin ?? false })
  })
})

router.get('/employe/:id', verifyLogin, (req, res) => {
  let employeeId = req.params.id;
  adminHelper.getIndividualEmployessDetails(employeeId).then((employee) => {
    res.render('admin/edit-employee', { employee, admin: true })
  })
})

router.post('/edit-employee/:id', verifyLogin, (req, res) => {
  let employeeId = req.params.id;
  let employee = req.body;
  adminHelper.updateEmployeeDetails(employeeId, employee).then(() => {
    res.redirect('/admin/employe')
  })
})

router.get('/delete-employee/:id', verifyLogin, (req, res) => {
  let employeeId = req.params.id;

  adminHelper.deleteEmployeeDetails(employeeId).then(() => {
    res.redirect('/admin/employe')
  }).catch((err) => {
    console.log("employee");
    res.redirect('/admin/employe')
  })
})

router.get('/all-credit-books/:id', verifyLogin, (req, res) => {
  let orderId = req.params.id;
  console.log(orderId);
  adminHelper.getHistoryCreditCard(orderId).then((creditBook) => {
    console.log(creditBook);
    res.render('admin/all-individualcredit', { creditBook, admin: true });
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
});
router.get('/add-employee', verifyLogin, (req, res) => {
  res.render('admin/add-employee', { admin: true });
})

router.post('/add-employee', verifyLogin, (req, res) => {
  adminHelper.addEmployeeDetails(req.body)
    .then((result) => {
      res.redirect('/admin/employe');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
})

router.get('/all-monthly-feet/:id', verifyLogin, (req, res) => {
  const id = req.params.id;
  adminHelper.getMonthlyClothFeet(id)
    .then((data) => {
      res.render('admin/all-cloth-monthly', { data, type: id, admin: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});

router.post('/add-monthly-feet/:type', verifyLogin, (req, res) => {
  const type = req.params.type;
  const data = { ...req.body, type };

  adminHelper.addMothlyClothFeet(data)
    .then(() => {
      res.redirect(`/admin/all-monthly-feet/${type}`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});

router.get('/add-monthly-feet/:type', verifyLogin, (req, res) => {
  const type = req.params.type;
  if (type === "JD") {
    res.render('admin/add-cloth-JD-monthly', { admin: true });
  } else if (type === "Windows") {
    res.render('admin/add-cloth-Windows-monthly', { admin: true });
  } else {
    res.status(404).send('Page not found');
  }
});

router.get('/edit-monthly-feet/:id', verifyLogin, (req, res) => {
  const id = req.params.id;
  adminHelper.getIndividualClothFeet(id).then((resp) => {
    res.render('admin/edit-cloth-monthly', { data: resp, admin: true });
  })
});

router.post('/edit-monthly-feet/:id', verifyLogin, (req, res) => {
  const id = req.params.id;
  const data = { ...req.body };
  adminHelper.updateClothFeet(id, data).then((response) => {
    res.redirect(`/admin/all-monthly-feet/${response.type}`);
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});

router.get('/delete-monthly-feet/:id/:type', verifyLogin, (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  adminHelper.getDeleteClothFeet(id).then(() => {
    res.redirect(`/admin/all-monthly-feet/${type}`);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Server Error');
  })
})

router.post('/blogDetails', verifyLogin, (req, res) => {
  adminHelper.addBlogUsDetails(req.body).then(async(id) => {
    if (req.files && req.files.image) {
      const image = req.files.image;
     // Create a readable stream from the uploaded image
     const fileStream = image.data;

     // Upload the image to Sufy bucket with key `banner/{id}.jpg`
     const bucketName = "windows"; // Replace with your bucket name
     const keyName = `blog/${id}.jpg`; // Dynamic key with banner ID

     await uploadImage(fileStream, bucketName, keyName);
    } else {
      console.log("No image uploaded");
    }

    console.log("blog details added successfully");
    res.redirect('/admin/blog');
  });
});


router.get('/blogDetails', verifyLogin, (req, res) => {
  adminHelper.getBlogDetails().then((response) => {
    res.render('admin/blogPage', { blogDetails: response, admin: true });
  }).catch((err) => {
    console.error("Error getting blog details:", err);
    res.redirect('/admin'); // or handle error appropriately
  });
});

router.get('/blogDetails/:id', verifyLogin, (req, res) => {
  const id = req.params.id;
  adminHelper.getindividualBlogDetails(id).then((response) => {
    console.log(response);
    res.render('admin/edit-blogdetails', { blogDetails: response, admin: true })
  }).catch((err) => {
    console.error("Error getting blog details:", err);
    res.redirect('/admin'); // or handle error appropriately
  })
});

router.post("/blogDetails/:id", verifyLogin, async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    // Update blog details in the database
    await adminHelper.updateBlogDetails(id, data);

    // Check if an image file is provided
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Create a readable stream from the uploaded image
      const fileStream = image.data;

      // S3 Bucket and Key
      const bucketName = "windows"; // Replace with your bucket name
      const keyName = `blog/${id}.jpg`; // Store the image in the "blog/" directory with dynamic ID

      // Upload the image to S3
      await uploadImage(fileStream, bucketName, keyName);
      console.log(`Blog image for ID ${id} uploaded successfully`);
    }

    // Redirect to the blog details page
    res.redirect("/admin/blogDetails");
  } catch (err) {
    console.error("Error updating blog details or uploading image:", err);

    // Redirect to the admin page or handle the error appropriately
    res.redirect("/admin");
  }
});

router.get('/blogDetails-delete/:id', verifyLogin, (req, res) => {
  const id = req.params.id;
  adminHelper.deleteBlogDetails(id).then((response) => {
    res.redirect('/admin/blogDetails')
  })
    .catch((err) => {
      console.error("Error getting blog details:", err);
      res.redirect('/admin'); // or handle error appropriately
    })
});





module.exports = router;
