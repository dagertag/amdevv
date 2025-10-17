async function checkAuth() {
    const response = await fetch('/api/auth');
    const userSection = document.getElementById('userSection');
    const authSection = document.getElementById('authSection');

    if (response.ok) {
        authSection.style.display = 'none';
        userSection.style.display = 'block';
    } else {
        authSection.style.display = 'block';
        userSection.style.display = 'none';
    }
}

document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        const response = await fetch('/api/logout', {method: 'POST'});

        if (response.ok) {
            window.location.href = '/';
        } else {
            const result = await response.json();
            document.getElementById('result').textContent = result.error || 'Ошибка выхода';
        }
    } catch (error) {
        console.error('Logout error:', error);
        document.getElementById('result').textContent = 'Ошибка сети';
    }
});

checkAuth();
