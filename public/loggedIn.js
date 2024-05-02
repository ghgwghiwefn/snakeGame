let username;
async function loggedIn() {
    const response = await fetch('/is-logged-in');
    let data = await response.json();
    if (data.loggedIn === true) {
        document.getElementById('account-name').innerHTML = data.username + ": " + data.level;
        username = data.username;
    } else {
        username = "guest";
    }
}
loggedIn();