document.getElementById('expense-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);



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
                'Authorization': 'Bearer ${token}',
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
    }  catch (error) {
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
        const token = localStorage.getItem('authToken');
        console.log('Token:', token);
        const response = await fetch('http://localhost:4000/expenses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const expenseList = document.getElementById('expense-list');
            expenseList.innerHTML = '';

            data.expenses.forEach(expense => {
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
                'Authorization': `Bearer ${token}`
            }
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

fetchExpenses();
