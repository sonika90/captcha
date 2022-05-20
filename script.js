// api url
let captcha;

let key;
const apiUrl = 'http://localhost:9091';
let status;
// Defining  function
function getCaptcha() {
    document.getElementById('message').innerHTML = "";
    document.getElementById("chkCaptcha").value = "";
    // POST request using fetch()
    fetch(`${apiUrl}/generate`, {
            // Adding method type
            method: 'POST',
            // Adding headers to the request
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
        // Converting to JSON
        .then((response) => response.json())
        .then(json => {
            document.getElementById('captcha').innerHTML = json.captchaSvg;
            key = json.key;
        });

}

function validateCaptcha() {
    // POST request using fetch()
    fetch(`${apiUrl}/validate`, {
            // Adding method type
            method: 'POST',
            body: JSON.stringify({
                key: key,
                text: document.getElementById("chkCaptcha").value,
            }),
            // Adding headers to the request
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
        // Converting to JSON
        .then((response) => response.json())
        .then(json => {
            document.getElementById('message').innerHTML = json.message;
            if (json.success) {
                document.getElementById('message').style.color = 'green';
            } else {
                document.getElementById('message').style.color = 'red';
            }
        })

}
