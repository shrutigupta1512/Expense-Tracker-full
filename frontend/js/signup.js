document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (name && email && password) {
        // Create an object to send as JSON to the backend
        const userData = { name, email, password };

        // Send a POST request to the backend
        fetch('http://localhost:4000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the response from the server
            alert('Signup successful');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Signup failed');
        });
    } else {
        alert('Please fill in all fields');
    }
});
