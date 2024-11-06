
// Parse the URL to extract query parameters
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (code && state) {
    // Now you have the `code` and `state` parameters
    console.log("Authorization Code:", code);
    console.log("State:", state);

    // Send the code to your backend server to get an access token
     fetch('https://YOUR_SERVER_URL/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
    })
    .then(response => response.json())
    .then(data => {
       console.log("Access Token:", data.access_token);
       // Store the token securely (e.g., in a cookie or local storage if safe)
    })
    .catch(error => {
        console.error("Error exchanging code for token:", error);
    });
} else {
    console.error("Authorization code or state is missing from URL.");
}