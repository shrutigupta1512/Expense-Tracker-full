window.onload = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    
    if (!userId || !token) {
        return; // User not logged in, skip the check
    }

    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();
            const buyPremiumButton = document.getElementById('buy-premium');
            const premiumStatusMessage = document.getElementById('premium-status');
            const leaderboardButton = document.getElementById('leaderboard-btn');
            const reportButton = document.getElementById('report-btn');


            if (userData.is_premium) {
                // User is a premium member
                buyPremiumButton.style.display = 'none'; // Hide the button
                premiumStatusMessage.textContent = "You are a premium user now!"; // Show the premium status
                premiumStatusMessage.style.display = 'block'; // Ensure the message is visible
                leaderboardButton.style.display = 'block'; // Show leaderboard button
                reportButton.style.display = 'block';
            } else {
                // User is not a premium member
                buyPremiumButton.style.display = 'block'; // Show the button
                premiumStatusMessage.style.display = 'none'; // Hide the premium status
                leaderboardButton.style.display = 'none'; // Hide leaderboard button
                reportButton.style.display = 'none';
            }
            // Store isPremium in localStorage
            localStorage.setItem('isPremium', userData.is_premium ? 'true' : 'false');
        } else {
            console.error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error checking user premium status:', error);
    }

// Event listener for report button to generate the report
// Report Button Event Listener
document.getElementById('report-btn').addEventListener('click', async () => {
    const filter = prompt('Enter filter (daily, monthly, yearly, or all):').toLowerCase();
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`http://localhost:4000/report/generate?filter=${filter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            alert('Report generated successfully. Click OK to download.');
            window.open(data.fileUrl);
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report.');
    }
});

document.getElementById('download-report-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');
    const fileUrl = prompt('Enter the file URL to download:');

    try {
        const response = await fetch(`http://localhost:4000/report/download?fileUrl=${encodeURIComponent(fileUrl)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileUrl.split('/').pop();
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error downloading the report:', error);
        alert('Error downloading the report.');
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken'); // Fetch auth token from localStorage

    try {
        const response = await fetch('http://localhost:4000/report/history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const { history } = await response.json();
            const historyContainer = document.getElementById('download-history');

            if (history.length === 0) {
                historyContainer.innerHTML = '<li>No download history found.</li>';
            } else {
                historyContainer.innerHTML = history
                    .map(
                        (item) =>
                            `<li>
                                <a href="${item.url}" target="_blank">${item.url}</a> 
                                <span>(Downloaded on: ${new Date(item.createdAt).toLocaleString()})</span>
                            </li>`
                    )
                    .join('');
            }
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error fetching download history:', error);
        alert('Failed to fetch download history.');
    }
});



     // Event listener for Leaderboard button
    document.getElementById('leaderboard-btn').addEventListener('click', async () => {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!isPremium) {
            alert('This feature is available for premium users only.');
            return;
        }

        await fetchLeaderboard();
        toggleSection('leaderboard-section');
    });

    // Sidebar toggle logic
    document.getElementById('toggle-menu').addEventListener('click', () => {
        const menu = document.getElementById('menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.getElementById('report-btn').addEventListener('click', () => {
        toggleSection('report-section');
    });

    // Fetch initial expenses
    fetchExpenses();
};
// Function to toggle visibility of sections
function toggleSection(sectionIdToShow) {
    const sections = ['form-section', 'expenses-section', 'leaderboard-section', 'report-section'];

    sections.forEach((sectionId) => {
        const section = document.querySelector(`.${sectionId}`);
        section.style.display = sectionId === sectionIdToShow ? 'block' : 'none';
    });
}
// Fetch leaderboard data and render
// Fetch leaderboard data and render
// Back button logic for Leaderboard
document.getElementById('back-from-leaderboard').addEventListener('click', () => {
    toggleSection('expenses-section');
});

// Back button logic for Report
document.getElementById('back-from-report').addEventListener('click', () => {
    toggleSection('expenses-section');
});
async function fetchLeaderboard() {
    const token = localStorage.getItem('authToken');
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear previous data

    try {
        const response = await fetch('http://localhost:4000/leaderboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();

            // Ensure the data contains a `leaderboard` array
            if (Array.isArray(data.leaderboard)) {
                data.leaderboard.forEach((user, index) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${index + 1}. ${user.name} - ₹${user.total_expense}`;

                    
                    leaderboardList.appendChild(listItem);
                });
            } else {
                console.error('Invalid leaderboard data format:', data);
                alert('Unexpected leaderboard data format received from the server.');
            }
        } else {
            console.error('Failed to fetch leaderboard data');
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

// Event listeners for filtering expenses





// Display expenses
const displayExpenses = (expenses) => {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    
    expenses.forEach((expense) => {
        const li = document.createElement('li');
        li.textContent = `${expense.category}: ₹${expense.amount} - ${expense.description}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', async () => {
            await deleteExpense(expense.id);
        });

        li.appendChild(deleteButton);
        expenseList.appendChild(li);
    });
};



document.getElementById('buy-premium').addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    console.log(`user_id_test ${userId}`)

    try {
        const response = await fetch('http://localhost:4000/premium/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: 500, userId }), // Example: 500 INR
        });

        const data = await response.json();

        if (!data.success) {
            alert('Failed to create order');
            return;
        }

        const { order } = data;

        const options = {
            key: 'rzp_test_OX8IYAujJCBR7x', // Replace with your Razorpay key
            amount: order.amount,
            currency: order.currency,
            name: 'Premium Membership',
            description: 'Upgrade to Premium',
            order_id: order.id,
            handler: async (response) => {
                const verifyResponse = await fetch('http://localhost:4000/premium/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        userId,
                    }),
                });

                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                    alert('You are now a premium user!');
                    document.getElementById('buy-premium').style.display = 'none'; // Hide the button
                    document.getElementById('premium-status').textContent = "You are a premium user now!"; // Show the premium message
                    document.getElementById('premium-status').style.display = 'block';
                    localStorage.setItem('isPremium', true);
                } else {
                    alert('Payment verification failed');
                }
            },
            prefill: {
                email: 'user@example.com',
                contact: '9999999999',
            },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error:', error);
    }
});


document.getElementById('expense-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('You are not logged in. Please login first.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, category, description }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to add expense');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('An error occurred while adding the expense');
    }
});



async function fetchExpenses() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('You are not logged in. Please login first.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/expenses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            const expenseList = document.getElementById('expense-list');
            expenseList.innerHTML = '';

            data.expenses.forEach((expense) => {
                const li = document.createElement('li');
                li.textContent = `${expense.category}: $${expense.amount} - ${expense.description}`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', async () => {
                    await deleteExpense(expense.id);
                });

                li.appendChild(deleteButton);
                expenseList.appendChild(li);
            });
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to fetch expenses');
        }
    } catch (error) {
        console.error('Error fetching expenses:', error);
        alert('An error occurred while fetching expenses');
    }
}

async function deleteExpense(expenseId) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('You are not logged in. Please login first.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert('Expense deleted successfully');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to delete expense');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('An error occurred while deleting the expense');
    }
}

loadExpenses(); // Initial fetch when the page loads
fetchExpenses();
