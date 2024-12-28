document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.token) {
            // Save token to local storage
            console.log('Inside condition:', data.token);
            await localStorage.setItem('authToken', data.token); // Correct key name
            console.log('Token:', data.token); // Log the correct token

 // Redirect to expense page
            // Redirect with token in query parameters
             window.location.href = `http://localhost:4000/expense?token=${data.token}`;

        } else {
            alert(data.message || 'Login failed!');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});
