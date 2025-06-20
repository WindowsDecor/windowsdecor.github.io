// $(document).bind("contextmenu",function(e){
//   return false;
// });
// import Handlebars from "handlebars";
//=======================USER SECTION JAVASCRIPT===================================
function addToCart(itemId) {
  $.ajax({
    url: '/add-to-cart/' + itemId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1;
        $("#cart-count").html(count)
        Swal.fire({
          title: 'Cart',
          text: 'This Item added to cart',
          icon: 'success',
          confirmButtonText: 'Ok'
        })
      } else {
        location.href = "/login"
      }
    }
  })
}

function sendData(e) {
  const searchResults = document.getElementById("searchResults");
  let match = e.value.match(/^[a-zA-Z]*/);
  let match2 = e.value.match(/\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = "";
    return;
  }
  if (match[0] === e.value) {
    fetch("/getSearchProduct", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: e.value }),
    })
      .then((res) => res.json())
      .then((data) => {
        let payload = data.payload;
        searchResults.innerHTML = "";
        if (payload.length < 1) {
          searchResults.innerHTML =
            '<p style="background-color:#ffff;color:rgb(89, 87, 87);padding:2%;margin:0">Sorry. Nothing Found</p>';
          return;
        }
        payload.forEach((item, index) => {
          if (index > 0)
            searchResults.innerHTML += '<hr style="margin:0;padding:0">';
          searchResults.innerHTML += `<a class="dropdown-item border-0 transition-link"  href="/view-single-product/${item._id}">${item.name}</a>`;
        });
      });

    return;
  }
}

function deleteProductFromCart(event) {

  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'Your Product has been deleted.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function cancelOrder(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Cancel Order',
    text: 'Your Order has been cancelled',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}



function userlogout(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "Are you going to logout?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'logout!',
        'logout successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function contactMessageOtpError(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Note',
    text: 'Unable to send otp to this Mobile No please contact admin:',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}

//=======================USER SECTION JAVASCRIPT END ===================================

//=======================ADMIN SECTION JAVASCRIPT=======================================
function deleteuser(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This user has been deleted successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}
function blockuser(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Block User',
    text: 'User has been blocked successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}

function unblockuser(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Unblock User',
    text: 'User has been unblocked successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}

function deleteProduct(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This product has been deleted successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function deletecategory(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This Category has been deleted successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function setbanner(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Banner',
    text: 'This Banner updated successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}
function setAboutUs(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'About Us Details',
    text: 'About Us Details updated successfully',
    icon: 'success',
    confirmButtonText: 'Ok'
  }).then(() => {
    window.location = link
  })
}

function deleteAboutUs(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'About Us Detail been deleted successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function deletebanner(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Deleted!',
        'This banner has been deleted successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function adminlogout(event) {
  event.preventDefault();
  var link = event.currentTarget.href;
  Swal.fire({
    title: 'Are you sure?',
    text: "Are you going to logout?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'logout!',
        'you logout successfully.',
        'success'
      ).then(() => {
        window.location = link
      })

    } else {
      return false;
    }
  })
}

function viewImageWhileUploading1(event) {
  // Create URL for the selected file
  var imageUrl = URL.createObjectURL(event.target.files[0]);

  // Get the container to insert the image
  var container = document.getElementById('image-container');

  // Clear the container
  container.innerHTML = '';

  // Insert the image only if there is an imageUrl
  if (imageUrl) {
    var imgTag = document.createElement('img');
    imgTag.src = imageUrl;
    imgTag.style.width = '200px';
    imgTag.style.height = '200px';
    imgTag.alt = 'banner-image';
    imgTag.id = 'imgView';
    container.appendChild(imgTag);
  }
}

function checkImageDimensions(input, event, requiredWidth = 0, requiredHeight = 0) {
  const file = input.files[0];
  const img = new Image();
  // console.log(requiredWidth, requiredWidth);
  img.src = URL.createObjectURL(file);
  img.onload = function () {
    // if (img.width !== requiredWidth || img.height !== requiredHeight) {
    //   alert(
    //     `Invalid image dimensions! Required: ${requiredWidth} x ${requiredHeight} px.`
    //   );
    //   input.value = ""; // Clear the file input
    //   URL.revokeObjectURL(img.src); // Free memory
    // } else {
      viewImageWhileUploading1(event);
      URL.revokeObjectURL(img.src); // Free memory
    // }
  };
}

// Handlebars.registerHelper('isSelected', function (value, comparison) {
//   return value === comparison ? 'selected' : '';
// });





//=======================ADMIN SECTION JAVASCRIPT END===================================