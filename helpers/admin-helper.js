var db = require('../config/connection');
var collections = require('../config/collection')
var objectId = require('mongodb').ObjectID;
var bcrypt = require('bcrypt')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid');

module.exports = {
   //Banner Section
   addBannerDetails: (banner) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.BANNER_COLLECTION).insertOne(banner).then((response) => {
            resolve(response.ops[0]._id)
         });
      })
   },


   getALLBanners: () => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.BANNER_COLLECTION).find().toArray().then((banner) => {
            resolve(banner)
         })
      })
   },

   activateBanner: (bannerId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) },
            {
               $set: {
                  status: true
               }
            }).then(async () => {
               let banners = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
               if (banners) {
                  let bannerIds = []
                  for (i = 0; i < banners.length; i++) {
                     bannerIds.push(banners[i]._id.toString())
                  }

                  var bannerIdToString = bannerId.toString()
                  var bannerIdsToDeactivate = bannerIds.filter(function (f) { return f !== bannerIdToString })

                  if (bannerIdsToDeactivate) {
                     for (i = 0; i < bannerIdsToDeactivate.length; i++) {
                        db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerIdsToDeactivate[i]) },
                           {
                              $set: {
                                 status: false
                              }
                           })
                     }
                  }
               }

               resolve()
            })
      })
   },
   deleteBanner: (bannerId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.BANNER_COLLECTION).removeOne({ _id: objectId(bannerId) }).then((response) => {
            resolve(response);
         })

      })
   },

   getBannerDetails: (bannerId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.BANNER_COLLECTION).findOne({ _id: objectId(bannerId) }).then((bannerDetail) => {
            resolve(bannerDetail)
         })
      })
   },

   updateBannerDetails: (bannerId, bannerDetail) => {
      return new Promise(async (resolve, reject) => {

         await db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {
            $set: {
               title1: bannerDetail.title1,
               title2: bannerDetail.title2,
            }
         }).then((response) => {
            resolve(response)
         })
      })

   },

   //Banner Section End


   //About Us section

   addAboutUsDetails: (aboutUs) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.ABOUT_US_COLLECTION).insertOne(aboutUs).then((response) => {
            resolve(response.ops[0]._id)
         });
      })
   },
   getALLAboutUsDetails: () => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ABOUT_US_COLLECTION).find().toArray().then((aboutUs) => {
            resolve(aboutUs)
         })
      })
   },

   activateAboutUs: (aboutUsId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ABOUT_US_COLLECTION).updateOne({ _id: objectId(aboutUsId) },
            {
               $set: {
                  status: true
               }
            }).then(async () => {
               let aboutUs = await db.get().collection(collections.ABOUT_US_COLLECTION).find().toArray()
               if (aboutUs) {
                  let aboutUsIds = []
                  for (i = 0; i < aboutUs.length; i++) {
                     aboutUsIds.push(aboutUs[i]._id.toString())
                  }

                  var aboutUsIdToString = aboutUsId.toString()
                  var aboutUsIdsToDeactivate = aboutUsIds.filter(function (f) { return f !== aboutUsIdToString })

                  if (aboutUsIdsToDeactivate) {
                     for (i = 0; i < aboutUsIdsToDeactivate.length; i++) {
                        db.get().collection(collections.ABOUT_US_COLLECTION).updateOne({ _id: objectId(aboutUsIdsToDeactivate[i]) },
                           {
                              $set: {
                                 status: false
                              }
                           })
                     }
                  }
               }

               resolve()
            })
      })
   },
   deleteAboutUs: (aboutUsId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ABOUT_US_COLLECTION).removeOne({ _id: objectId(aboutUsId) }).then((response) => {
            resolve(response);
         })

      })
   },

   getAboutUsDetails: (aboutUsId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.ABOUT_US_COLLECTION).findOne({ _id: objectId(aboutUsId) }).then((aboutUsDetail) => {
            resolve(aboutUsDetail)
         })
      })
   },

   updateAboutUsDetails: (aboutUsId, aboutUsDetail) => {
      return new Promise(async (resolve, reject) => {

         await db.get().collection(collections.ABOUT_US_COLLECTION).updateOne({ _id: objectId(aboutUsId) }, {
            $set: {
               title1: aboutUsDetail.title1,
               title2: aboutUsDetail.title2,
               description: aboutUsDetail.description,
            }
         }).then((response) => {
            resolve(response)
         })
      })

   },
   //About Us Section End

   //Branch Section start
   addBranchDetails: (branch) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.BRANCH_COLLECTION).insertOne(branch).then((response) => {
            resolve(response.ops[0]._id)
         });
      })
   },
   getALLBranchDetails: () => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.BRANCH_COLLECTION).find().toArray().then((branch) => {
            resolve(branch)
         })
      })
   },

   deleteBranch: (branchId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.BRANCH_COLLECTION).removeOne({ _id: objectId(branchId) }).then((response) => {
            resolve(response);
         })

      })
   },

   getBranchDetails: (branchId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.BRANCH_COLLECTION).findOne({ _id: objectId(branchId) }).then((branchDetail) => {
            resolve(branchDetail)
         })
      })
   },

   updateBranchDetails: (branchId, branchDetail) => {
      return new Promise(async (resolve, reject) => {

         await db.get().collection(collections.BRANCH_COLLECTION).updateOne({ _id: objectId(branchId) }, {
            $set: {
               place: branchDetail.place,
               mobile: branchDetail.mobile,
               address: branchDetail.address,
            }
         }).then((response) => {
            resolve(response)
         })
      })

   },

   //Branch Section End
   //category section
   addCategory: (categoryDetails) => {
      return new Promise(async (resolve, reject) => {
         let categoryData = await db.get().collection(collections.CATEGORY_COLLECTION).insertOne(categoryDetails);
         resolve(categoryData.ops[0]._id);
      })

   }
   , getALLCategory: () => {
      return new Promise(async (resolve, reject) => {
         let allCategory = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
         resolve(allCategory)
      })
   }
   , deleteCategory: (categoryId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CATEGORY_COLLECTION).removeOne({ _id: objectId(categoryId) }).then((response) => {
            resolve(response);
         })

      })
   }
   , getCategorytDetails: (categoryId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ _id: objectId(categoryId) }).then((category) => {
            resolve(category)
         })
      })
   }

   , updateCategory: (categoryId, categoryDetail) => {
      return new Promise(async (resolve, reject) => {

         await db.get().collection(collections.CATEGORY_COLLECTION).updateOne({ _id: objectId(categoryId) }, {
            $set: {
               categoryName: categoryDetail.categoryName
            }
         }).then((response) => {
            resolve(response)
         })
      })

   },

   //Product section
   addProduct: (product) => {
      return new Promise(async (resolve, reject) => {
         let data = await db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product);
         resolve(data.ops[0]._id);
      })
   },
   getALLProducts: () => {
      return new Promise(async (resolve, reject) => {
         let items = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
         resolve(items)
      })
   },
   deleteProduct: (prodId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.PRODUCT_COLLECTION).removeOne({ _id: objectId(prodId) }).then((response) => {
            resolve(response);
         })

      })
      //get Single Product Detail
   },
   getProductDetails: (prodId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
            resolve(product)
         })
      })
   },
   updateProduct: (prodId, productDetail) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, {
            $set: {
               name: productDetail.name,
               brand: productDetail.brand,
               description: productDetail.description,
               price: productDetail.price,
               price2: productDetail.price2,
               category: productDetail.category,
               offer: productDetail.offer,
               size: productDetail.size,
               colour: productDetail.colour,
               design: productDetail.design
            }
         }).then((response) => {
            resolve(response)
         })
      })

   },

   getRandomProducts: () => {
      return new Promise(async (resolve, reject) => {
         let items = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([{ $sample: { size: 8 } }]).toArray()
         resolve(items)
      })
   },
   getRelatedProducts: (category1) => {
      return new Promise(async (resolve, reject) => {
         let relatedProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([{ $match: { category: category1 } }]).toArray()
         resolve(relatedProducts)
      })
   }
   //Product section End

   // User Section
   , getALLusers: () => {
      return new Promise(async (resolve, reject) => {
         let usersList = await db.get().collection(collections.USER_COLLECTION).find().toArray()
         resolve(usersList)
      })
   }
   , deleteUser: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USER_COLLECTION).removeOne({ _id: objectId(userId) }).then((response) => {
            resolve(response);
         })

      })
   },
   otpsent: (number) => {
      return new Promise(async (resolve, reject) => {
         let otp = Math.floor(100000 + Math.random() * 900000);
         let token = uuidv4();
         let data = await db.get().collection(collections.OTP_COLLECTION).insertOne({ otp, token, number });
         if (data) resolve({ token, otp, number })
         else reject()
      })
   },
   verifyOTP: (otp, id, number) => {
      return new Promise(async (resolve, reject) => {
         let data = await db.get().collection(collections.OTP_COLLECTION).findOne({ token: id });
         console.log("called data");
         console.log(data);

         if (data && data.otp == otp && data.number == number) resolve(data);
         else reject();
      })
   }
   , doLogin: (data) => {
      return new Promise(async (resolve, reject) => {
         // let response = {}
         // let admin = {}
         console.log(data);
         const logindata = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ email: data.email, mobile: data.mobile })
         // console.log(logindata);
         if (logindata) {
            logindata.status = true
            resolve(logindata)
         }
         else {
            resolve({ status: false })
         }
         resolve({ status: false })

         // console.log(data.password);
         // admin.email = "adon@gmail.com"
         // admin.password = "$2a$10$0GacidLXw.NVGMi7EA8zb.A3MCyYIsuPgn6Ar.sXDjX6zpJIrkfeG"
         // if (admin.email === admin.email) {
         //    bcrypt.compare("1", admin.password).then((status) => {
         //       if (status) {
         //          response.admin = admin
         //          response.status = true
         //          resolve(response)
         //       } else {
         //          resolve({ status: false })
         //       }
         //    })
         // } else {
         //    resolve({ status: false })
         // }
      })

   }
   , blockUser: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
            {
               $set: {
                  blockuser: true
               }
            }).then((response) => {
               resolve()
            })
      })
   }
   , unblockUser: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
            {
               $set: {
                  blockuser: false
               }
            }).then((response) => {
               resolve()
            })
      })
   }
   // User Section End

   , getALLOrders: () => {
      return new Promise(async (resolve, reject) => {
         let orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
         resolve(orders)
      })
   },
   changeStatus: (orderId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
            {
               $set: {
                  status: 'Order-ready',
                  order_ready: true//For controling the order status option
               }
            }).then(() => {
               resolve({ status: true })
            })
      })
   },
   changeStatusDelivered: (orderId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
            {
               $set: {
                  status: 'Delivered',
                  delivered: true
               }
            }).then(() => {
               resolve({ status: true })
            })
      })
   },
   insertCoupon: (coupons) => {
      return new Promise((resolve, reject) => {
         coupons.offer = parseInt(coupons.offer)
         db.get().collection(collections.COUPON_COLLECTION).insertOne(coupons);
      })
   }
   , availableCoupons: () => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((data) => {
            resolve(data)
         })
      })
   },

   deleteCoupon: (couponId) => {
      return new Promise((resolve, reject) => {
         //console.log(couponId);
         //console.log(objectId(couponId));
         db.get().collection(collections.COUPON_COLLECTION).removeOne({ _id: objectId(couponId) }).then((response) => {
            resolve(response);
         })

      })
   },
   activateCoupon: (couponId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.COUPON_COLLECTION).updateOne({ _id: objectId(couponId) },
            {
               $set: {
                  status: true
               }
            }).then(() => {
               resolve()
            })
      })
   },
   deactivateCoupon: (couponId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.COUPON_COLLECTION).updateOne({ _id: objectId(couponId) },
            {
               $set: {
                  status: false
               }
            }).then(() => {
               resolve()
            })
      })
   }

   , paymentMethods: () => {
      let Methods = []
      return new Promise(async (resolve, reject) => {
         let CodProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  paymentMethod: 'cod'
               }
            }
         ]).toArray()
         let codlen = CodProduct.length
         Methods.push(codlen)

         let onlineProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  paymentMethod: 'online'
               }
            }
         ]).toArray()
         let onlinelen = onlineProduct.length
         Methods.push(onlinelen)

         resolve(Methods)
      })
   },
   OrderStatus: () => {
      let status = []
      return new Promise(async (resolve, reject) => {
         let pending = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'pending'
               }
            }
         ]).toArray()
         let pendinglen = pending.length
         status.push(pendinglen)
         let placed = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'placed'
               }
            }
         ]).toArray()
         let placedlen = placed.length
         status.push(placedlen)

         let order_ready = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'Order-ready'
               }
            }
         ]).toArray()
         let shippedlen = order_ready.length
         status.push(shippedlen)


         let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'Delivered'
               }
            }
         ]).toArray()
         let deliveredlen = delivered.length
         status.push(deliveredlen)

         let cancelled = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'cancelled'
               }
            }
         ]).toArray()
         let cancelledlen = cancelled.length
         status.push(cancelledlen)
         resolve(status)
      })
   },
   getFoodItemCount: () => {
      return new Promise(async (resolve, reject) => {
         let foodItemCount = await db.get().collection(collections.FOOD_ITEM_COLLECTION).count()
         resolve(foodItemCount)
      })
   },
   getUserCount: () => {
      return new Promise(async (resolve, reject) => {
         let usercount = await db.get().collection(collections.USER_COLLECTION).count()
         resolve(usercount)
      })
   },
   getProfit: () => {
      return new Promise(async (resolve, reject) => {
         let newtotal = 0
         let total = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'Delivered'
               }
            },
            {
               $group: {
                  _id: null,
                  total: { $sum: '$totalAmount' }
               }
            }
         ]).toArray()
         if (total[0]) {
            // console.log(total)
            resolve(total[0].total)
         } else {
            resolve(newtotal)
         }
      })
   },
   getDeliveredCount: () => {
      return new Promise(async (resolve, reject) => {
         let delivered = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  status: 'Delivered'
               }
            }
         ]).toArray()
         let deliveredCount = delivered.length
         resolve(deliveredCount)
      })
   },
   getOrderReport: (data) => {
      let StartDate = data.StartDate
      let EndDate = data.EndDate
      //  console.log(StartDate);
      //  console.log(EndDate);
      return new Promise(async (resolve, reject) => {
         orderData = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: {
                  date: {
                     $gte: StartDate,
                     $lte: EndDate,
                  },
               },
            }]).toArray()
         resolve(orderData)
      })
   },

   addCustomer: (customer) => {
      return new Promise(async (resolve, reject) => {
         let data = await db.get().collection(collections.CUSTOMER_COLLECTION).insertOne(customer);
         resolve(data.ops[0]._id);
      })
   },
   getALLCustomers: () => {
      return new Promise(async (resolve, reject) => {
         let customers = await db.get().collection(collections.CUSTOMER_COLLECTION).find().toArray()
         console.log(customers);
         resolve(customers)
      })
   },
   deleteCustomer: (customerId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CUSTOMER_COLLECTION).removeOne({ _id: objectId(customerId) }).then((response) => {
            resolve(response);
         })

      })

   },
   getCustomertDetails: (customerId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.CUSTOMER_COLLECTION).findOne({ _id: objectId(customerId) }).then((customer) => {
            resolve(customer)
         })
      })
   },
   getallCustomertDetails: () => {
      return new Promise(async (resolve, reject) => {
         let customers = await db.get().collection(collections.CUSTOMER_COLLECTION).find().toArray()
         resolve(customers)
      })
   },
   addEmployeeDetails: (employee) => {
      return new Promise(async (resolve, reject) => {
         employee.totalAmount = 0;
         let data = await db.get().collection(collections.EMPLOYEE_COLLECTION).insertOne(employee);
         if (data) {
            resolve(data.ops[0]._id);
         }
         else {
            reject("Failed to insert employee details");
         }
      })
   },
   getallEmployeeDetails: () => {
      return new Promise(async (resolve, reject) => {
         let employees = await db.get().collection(collections.EMPLOYEE_COLLECTION).find().toArray()
         resolve(employees)
      })
   },
   getIndividualEmployessDetails: (id) => {
      return new Promise(async (resolve, reject) => {
         let employees = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(id) })
         resolve(employees)
      })
   },

   updateEmployeeDetails: (id, details) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...details } };
         let data = await db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({ _id: objectId(id) },
            updateFields
         ).then((response) => {
            resolve(response)
         }).catch((res) => {
            reject(res);
         })
      })
   },

   deleteEmployeeDetails: (id) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.EMPLOYEE_COLLECTION).removeOne({ _id: objectId(id) }).then((response) => {
            resolve(response);
         })
      })
   },

   updateCustomerDetails: (customerId, customerDetails) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...customerDetails } };
         await db.get().collection(collections.CUSTOMER_COLLECTION).updateOne({ _id: objectId(customerId) },
            updateFields
         ).then((response) => {
            resolve(response)
         })
      })
   },
   //credit-book
   addCreditBook: (creditBook) => {
      return new Promise(async (resolve, reject) => {
         const { staffname } = creditBook
         let data = await db.get().collection(collections.CREDIT_BOOK_COLLECTION).insertOne(creditBook);
         let employee = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(staffname) })
         if (staffname) {
            if (employee) {
               if (creditBook.debitAmount != 0 || creditBook.creditAmount != 0) {
                  const totalAmount = parseFloat(employee.totalAmount ?? 0);
                  const creditAmount = parseFloat(creditBook.creditAmount);
                  const debitAmount = parseFloat(creditBook.debitAmount);
                  const newTotalAmount = totalAmount + creditAmount - debitAmount;
                  if (newTotalAmount > 0) {
                     employee.totalAmount = newTotalAmount.toString();
                     const creditBookRecord = {
                        ...data.ops[0],
                        oldbalance: totalAmount,
                        currentAmount: newTotalAmount,
                        creditAmount: creditAmount,
                        debitAmount: debitAmount
                     };
                     if (employee.creditBook) {
                        employee.creditBook.push(creditBookRecord)
                     }
                     else {
                        employee.creditBook = [creditBookRecord]
                     }
                     console.log(employee);
                     const updateFields = { $set: { ...employee } };
                     db.get().collection(collections.EMPLOYEE_COLLECTION).updateOne({ _id: objectId(staffname) }, updateFields)
                     resolve({ data: data, status: employee });
                  } else {
                     reject("Insufficient balance");
                  }
               }
               else {
                  reject("debit and credit value is Zero")
               }
            }
            else {
               reject("Employee not found")
            }
         }
         else {
            reject("employee not found ");
         }
      })
   },
   getOldBalance: (user) => {
      return new Promise(async (resolve, reject) => {
         let employee = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(user) })
         if (employee) {
            if (employee.totalAmount) {
               resolve(employee.totalAmount)
            }
            else {
               resolve("0")
            }
         }
         else {
            reject("user not found")
         }

      })
   }
   ,
   getALLCreditBooks: () => {
      return new Promise(async (resolve, reject) => {
         let creditBooks = await db.get().collection(collections.CREDIT_BOOK_COLLECTION).find().toArray()
         resolve(creditBooks)
      })
   },
   deleteCreditBook: (creditBookId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CREDIT_BOOK_COLLECTION).removeOne({ _id: objectId(creditBookId) }).then((response) => {
            resolve(response);
         })

      })

   },
   getCreditBookDetails: (creditBookId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.CREDIT_BOOK_COLLECTION).findOne({ _id: objectId(creditBookId) }).then((creditBook) => {
            resolve(creditBook)
         })
      })
   },
   updateCreditBookDetails: (creditBookId, creditBookDetails) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...creditBookDetails } };
         await db.get().collection(collections.CREDIT_BOOK_COLLECTION).updateOne({ _id: objectId(creditBookId) },
            updateFields
         ).then((response) => {
            resolve(response)
         })
      })
   },
   //Dealer Section
   addDealerDetail: (dealerDetail) => {
      return new Promise(async (resolve, reject) => {
         let data = await db.get().collection(collections.DEALER_COLLECTION).insertOne(dealerDetail);
         resolve(data.ops[0]._id);
      })
   },
   getALLDealerDetails: () => {
      return new Promise(async (resolve, reject) => {
         let dealerDetails = await db.get().collection(collections.DEALER_COLLECTION).find().toArray()
         resolve(dealerDetails)
      })
   },
   deleteDealerDetail: (dealerDetailId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.DEALER_COLLECTION).removeOne({ _id: objectId(dealerDetailId) }).then((response) => {
            resolve(response);
         })

      })

   },
   getDealerDetail: (dealerDetailId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.DEALER_COLLECTION).findOne({ _id: objectId(dealerDetailId) }).then((dealerDetail) => {
            resolve(dealerDetail)
         })
      })
   },
   updateDealerDetail: (dealerDetailId, dealerDetail) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...dealerDetail } };
         await db.get().collection(collections.DEALER_COLLECTION).updateOne({ _id: objectId(dealerDetailId) },
            updateFields
         ).then((response) => {
            resolve(response)
         })
      })
   },
   //Monthly Square Feet Section
   addMonthlySquareFeet: (monthlySquareFeet) => {
      return new Promise(async (resolve, reject) => {
         let data = await db.get().collection(collections.MONTHLY_SQUARE_FEET).insertOne(monthlySquareFeet);
         resolve(data.ops[0]._id);
      })
   },
   getALLMonthlySquareFeet: () => {
      return new Promise(async (resolve, reject) => {
         let monthlySquareFeet = await db.get().collection(collections.MONTHLY_SQUARE_FEET).find().toArray()
         resolve(monthlySquareFeet)
      })
   },
   getSingleMonthlySquareFeet: (type) => {
      return new Promise(async (resolve, reject) => {
         let monthlySquareFeet = await db.get().collection(collections.MONTHLY_SQUARE_FEET).find({ productType: type }).toArray()
         resolve(monthlySquareFeet)
      })
   },
   deleteMonthlySquareFeet: (monthlySquareFeetId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.MONTHLY_SQUARE_FEET).removeOne({ _id: objectId(monthlySquareFeetId) }).then((response) => {
            resolve(response);
         })

      })

   },
   getMonthlySquareFeet: (monthlySquareFeetId) => {
      return new Promise(async (resolve, reject) => {
         await db.get().collection(collections.MONTHLY_SQUARE_FEET).findOne({ _id: objectId(monthlySquareFeetId) }).then((monthlySquareFeet) => {
            resolve(monthlySquareFeet)
         })
      })
   },
   updateMonthlySquareFeet: (monthlySquareFeetId, monthlySquareFeet) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...monthlySquareFeet } };
         await db.get().collection(collections.MONTHLY_SQUARE_FEET).updateOne({ _id: objectId(monthlySquareFeetId) },
            updateFields
         ).then((response) => {
            resolve(response)
         })
      })
   },
   //get product detail based on singele order id
   getOrderproduct: (orderId) => {
      return new Promise(async (resolve) => {
         // console.log(orderId)
         let OrderProductItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([{ $match: { _id: objectId(orderId) } },
         {
            $unwind: "$products",
         },
         {
            $project: {
               item: "$products.item",
               quantity: "$products.quantity",
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
         //console.log(OrderProductItems)
         resolve(OrderProductItems);
      });
   },
   deleteOrder: (orderId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ORDER_COLLECTION).removeOne({ _id: objectId(orderId) }).then((response) => {
            resolve(response);
         })

      })
   },

   getALLContacts: () => {
      return new Promise(async (resolve, reject) => {
         let contacts = await db.get().collection(collections.CONTACT_COLLECTION).find().toArray()
         resolve(contacts)
      })
   },
   deleteContact: (contactId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CONTACT_COLLECTION).removeOne({ _id: objectId(contactId) }).then((response) => {
            resolve(response);
         })

      })

   },
   getALLCarts: () => {
      return new Promise(async (resolve, reject) => {
         let carts = await db.get().collection(collections.CART_COLLECTION).find().toArray()
         resolve(carts)
      })
   },
   getCartproduct: (cartId) => {
      return new Promise(async (resolve) => {
         // console.log(orderId)
         let cartProductItems = await db.get().collection(collections.CART_COLLECTION).aggregate([{ $match: { _id: objectId(cartId) } },
         {
            $unwind: "$products",
         },
         {
            $project: {
               item: "$products.item",
               quantity: "$products.quantity",
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
         //console.log(OrderProductItems)
         resolve(cartProductItems);
      });
   },
   deleteCart: (cartId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CART_COLLECTION).removeOne({ _id: objectId(cartId) }).then((response) => {
            resolve(response);
         })

      })
   },
   getHistoryCreditCard: (creditBookId) => {
      return new Promise(async (resolve, reject) => {
         const employee = await db.get().collection(collections.EMPLOYEE_COLLECTION).findOne({ _id: objectId(creditBookId) })
         if (employee) {
            if (employee.creditBook) {
               resolve(employee.creditBook);
            }
            else {
               console.log("Called empty");
               resolve([]);
            }
         }
         else {
            reject("internal server error")
         }
      })
   },
   addMothlyClothFeet: (data) => {
      return new Promise(async (resolve, reject) => {
         const cloth = await db.get().collection(collections.MONTHLY_CLOTH_FEET).insertOne(data)
         if (cloth) {
            resolve(cloth.ops[0]._id);
         }
         else {
            reject("internal server error")
         }
      })
   },
   getMonthlyClothFeet: (type) => {
      return new Promise(async (resolve, reject) => {
         const cloth = await db.get().collection(collections.MONTHLY_CLOTH_FEET).find({ type: type }).toArray()
         if (cloth) {
            resolve(cloth);
         }
         else {
            reject("internal server error")
         }
      })
   },
   getIndividualClothFeet: (id) => {
      return new Promise(async (resolve, reject) => {
         const cloth = await db.get().collection(collections.MONTHLY_CLOTH_FEET).findOne({ _id: objectId(id) })
         if (cloth) {
            console.log(cloth);

            resolve(cloth);
         }
         else {
            reject("internal server error")
         }
      })
   },
   updateClothFeet: (monthlySquareFeetId, monthlySquareFeet) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...monthlySquareFeet } };
         await db.get().collection(collections.MONTHLY_CLOTH_FEET).updateOne({ _id: objectId(monthlySquareFeetId) },
            updateFields
         ).then(async () => {
            const response = await db.get().collection(collections.MONTHLY_CLOTH_FEET).findOne({ _id: objectId(monthlySquareFeetId) })
            console.log("called success");
            resolve(response)

         }).catch(() => {
            reject("internal server error")
         })
      })
   },
   getDeleteClothFeet: (id) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.MONTHLY_CLOTH_FEET).removeOne({ _id: objectId(id) }).then((response) => {
            resolve(response);
         })
            .catch(() => {
               reject("internal server error")
            })

      })
   },

   addBlogUsDetails: (blog) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.BLOG_US_COLLECTION).insertOne(blog).then((response) => {
            resolve(response.ops[0]._id)
         });
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
   getindividualBlogDetails: (Id) => {
      return new Promise(async (resolve, reject) => {
         const data = db.get().collection(collections.BLOG_US_COLLECTION).findOne({ _id: objectId(Id) })
         if (data) {
            resolve(data)
         }
         else {
            reject("internal server error")
         }
      })
   },
   updateBlogDetails: (id, blogDetails) => {
      return new Promise(async (resolve, reject) => {
         const updateFields = { $set: { ...blogDetails } };
         await db.get().collection(collections.BLOG_US_COLLECTION).updateOne({ _id: objectId(id) },
            updateFields
         ).then(() => {
            resolve(id)
         }).catch(() => {
            reject("internal server error")
         })
      })
   },
   deleteBlogDetails: (Id) => {
      return new Promise(async (resolve, reject) => {
         db.get().collection(collections.BLOG_US_COLLECTION).removeOne({ _id: objectId(Id) }).then((data) => {
            resolve(data)

         }).catch((err) => {
            reject(err)
         })
      })
   }




}

