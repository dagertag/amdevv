document.getElementById('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: e.target.username.value,
        login: e.target.login.value,
        password: e.target.password.value
    };

    const response = await fetch('/api/register', {
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
});