import * as fs from "fs";

async function main() {
  const formData = new FormData();
  // Create a dummy image
  const blob = new Blob(["test"], { type: "image/webp" });
  formData.append("file", blob, "test.webp");
  formData.append("productId", "DW-TEST");

  // We need to pass the cookie to authenticate
  const headers = new Headers();
  // But wait, the API requires a valid jwt token from cookies for the "owner" role.
  // I can't easily generate that token from here without the secret.
  
  console.log("Cannot test API directly without auth cookie.");
}

main();
