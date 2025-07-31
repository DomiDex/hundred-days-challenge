// Script to manually add website_link field to Author custom type
// This is a workaround for when Slice Machine push doesn't work

const https = require('https');

// IMPORTANT: You need to get these values from your Prismic dashboard
// 1. Go to Settings > API & Security > Generate an access token
// 2. Repository name is "hundred-days-challenge"

const REPOSITORY_NAME = 'hundred-days-challenge';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with your token

console.log(`
===========================================
MANUAL FIELD ADDITION INSTRUCTIONS
===========================================

Since Slice Machine login is blocked, please follow these steps:

1. Go to https://prismic.io and login to your account
2. Navigate to your repository: ${REPOSITORY_NAME}
3. Go to Custom Types > Author
4. Click on "JSON editor" tab
5. Find the section with social links (after "github_link")
6. Add the following JSON (don't forget the comma after github_link):

"website_link": {
  "type": "Link",
  "config": {
    "label": "Personal Website",
    "placeholder": "Link to personal website",
    "select": "web",
    "allowTargetBlank": true
  }
}

7. Click "Save"

The field should now appear in your Author custom type!

Alternative: If you can access Settings > API & Security in Prismic,
you can generate an access token and update the ACCESS_TOKEN 
variable in this script to automate the process.
`);