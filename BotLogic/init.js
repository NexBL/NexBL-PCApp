const fs = require('fs');
const path = require('path');

// Check if axios is installed
let axios;
try {
  axios = require('axios');
} catch (error) {
  console.error('Axios is not installed. Please install it by running: npm install axios');
  process.exit(1);
}

// Function to get an access token using device auth
async function getAccessToken(accountId, deviceId, secret) {
  try {
    const response = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', 
      'grant_type=device_auth&account_id=' + accountId + '&device_id=' + deviceId + '&secret=' + secret, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU='
        }
      });
    
    return response.data;
  } catch (error) {
    console.error(`Error getting access token for account ${accountId}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Function to initialize and get tokens for all accounts
async function initializeAccounts() {
  try {
    // Read accounts.json file
    const accountsPath = path.join(__dirname, 'accounts.json');
    const accountsData = fs.readFileSync(accountsPath, 'utf8');
    const accounts = JSON.parse(accountsData);
    
    console.log(`Found ${accounts.length} accounts in accounts.json`);
    
    // Get access tokens for each account
    for (const account of accounts) {
      console.log(`Processing account: ${account.account_id}`);
      const tokenData = await getAccessToken(account.account_id, account.device_id, account.secret);
      
      if (tokenData) {
        // Add username property to account
        account.username = tokenData.displayName;
        console.log(`Successfully obtained access token for account ${account.account_id}`);
        console.log('Access Token:', tokenData.access_token);
        console.log('Expires In:', tokenData.expires_in, 'seconds');
        console.log('Refresh Token:', tokenData.refresh_token);
        console.log("Display Name:", tokenData.displayName);
        console.log('-----------------------------------');

        try {

          const testRequest1 = await axios.post(`https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storeaccess/v1/request_access/${account.account_id}`, {}, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          });
          console.log('Test Request:', testRequest1.data);

        const testRequest2 = await axios.post(`https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/${account.account_id}/client/QueryProfile?profileId=athena`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        console.log('Test Request 2:', testRequest2.data);


        const testRequest3 = await axios.post(`https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/${account.account_id}/client/QueryProfile?profileId=common_core`, {}, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          });
          
          console.log('Test Request 3:', testRequest3.data);



          console.log(`Account ${account.account_id} access token is valid`);
        } catch (error) {
          console.error(`Error testing access token for account ${account.account_id}:`, error.message);
          console.error('Response data:', error);
        }

      }
    }
    
    // Save updated accounts with username property
    try {
      fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 4), 'utf8');
      console.log('Updated accounts.json with username property for all accounts.');
    } catch (err) {
      console.error('Failed to write updated accounts.json:', err);
    }
    console.log('All accounts processed');
  } catch (error) {
    console.error('Error initializing accounts:', error);
  }
}

// Export the initialization function
module.exports = {
  initializeAccounts
};

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeAccounts();
}