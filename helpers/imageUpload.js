  const { S3Client, PutObjectCommand,DeleteObjectCommand,HeadObjectCommand } = require("@aws-sdk/client-s3");

// Initialize S3 client
const s3 = new S3Client({
    region: "ap-southeast-2", // Asia Pacific (Hanoi) RegionID
    endpoint: "https://mos.ap-southeast-2.sufybkt.com", // Asia Pacific (Hanoi) Endpoint
    credentials: {
      accessKeyId: "RwhCmsMLPUNyQAPAhcRnwdtJ4Ya7-pkOD3pK8HER",
      secretAccessKey: "GRQ9mMdfdAV1dXa8kllyxZ-Jo_uKi3rqC9goYInC",
    },
  });

// Function to upload image to Sufy bucket
async function uploadImage(fileStream, bucketName, keyName) {
    try {
      // Prepare upload command
      const uploadParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: fileStream,
        ContentType: "image/jpeg", // Adjust MIME type as needed
      };
  
      const command = new PutObjectCommand(uploadParams);
  
      // Upload the file
      const response = await s3.send(command);
      console.log("Upload Successful", response);
      return response;
    } catch (error) {
      console.error("Error uploading file", error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  }

// Function to check if an image exists in S3
async function checkImageExists(bucketName, keyName) {
  try {
    const params = {
      Bucket: bucketName, // Your bucket name
      Key: keyName,       // Path to the image in your bucket
    };

    // Use HeadObjectCommand to check if the image exists
    const command = new HeadObjectCommand(params);
    await s3.send(command);
    return true; // Image exists
  } catch (error) {
    if (error.name === 'NotFound') {
      return false; // Image does not exist
    }
    throw error; // Rethrow other errors
  }
}

// Function to delete image from S3 if it exists
async function deleteImage(bucketName, keyName) {
  const exists = await checkImageExists(bucketName, keyName);
  if (exists) {
    try {
      // Proceed to delete the image if it exists
      const deleteParams = {
        Bucket: bucketName,
        Key: keyName,
      };

      const command = new DeleteObjectCommand(deleteParams);

      // Delete the file
      const response = await s3.send(command);
      console.log("Image deleted successfully:", response);
      return response;
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      throw error; // Rethrow to handle in the calling function
    }
  } else {
    console.log("Image does not exist, skipping delete.");
  }
}

  // Export the function
module.exports = { uploadImage ,deleteImage,checkImageExists};