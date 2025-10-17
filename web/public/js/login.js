document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        login: e.target.login.value,
        password: e.target.password.value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = '/tasks';
        } else {
            document.getElementById('result').textContent = result.error || 'Ошибка авторизации';
        }
    } catch (error) {
        document.getElementById('result').textContent = 'Ошибка сети';
    }
});