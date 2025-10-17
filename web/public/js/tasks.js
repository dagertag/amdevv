const API_URL = '/api/tasks';
let tasksData = [];
let tableFilters = null;

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.success) {
            document.getElementById('error').textContent = 'Ошибка: ' + (data.error || 'Неизвестная ошибка');
            return;
        }

        tasksData = data.tasks;

        if (tableFilters) {
            tableFilters.setData(tasksData);
        } else {
            renderTable(tasksData);
        }

    } catch (err) {
        document.getElementById('error').textContent = 'Ошибка загрузки: ' + err.message;
    }
}

async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth');

        if (response.ok) {
            const data = await response.json();

            if (data.success && data.user) {
                document.getElementById('welcomeSection').style.display = 'block';
                document.getElementById('welcomeMessage').textContent =
                    `Добро пожаловать, ${data.user.login || data.user.username}!`;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

function renderTable(tasks) {
    const tbody = document.querySelector('#tasksTable tbody');
    tbody.innerHTML = '';

    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Нет задач</td></tr>';
        return;
    }

    tasks.forEach(task => {
        const createdDate = task.created_at.split(' ')[0];
        const updatedDate = task.update_at ? task.update_at.split(' ')[0] : '-';

        // Используем поле status_label напрямую из данных задачи
        const statusName = task.status_label || task.label || 'Неизвестный статус';

        const hasMessage = task.messages_text && task.messages_created_at;
        const messageCell = hasMessage ?
            `<td class="has-message" onclick="showMessage('${task.messages_text}', '${task.messages_created_at}')">✉️</td>` :
            `<td class="no-message">🚫</td>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${createdDate}</td>
            <td>${updatedDate}</td>
            <td>${statusName}</td>
            <td>${task.description}</td>
            ${messageCell}
        `;
        tbody.appendChild(row);
    });

    updateSortIndicators();
}

function updateSortIndicators() {
    // Сбрасываем все индикаторы
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.textContent = '▼▲';
    });

    if (currentSortField) {
        const currentBtn = document.querySelector(`.sort-btn[data-sort="${currentSortField}"]`);
        if (currentBtn) {
            currentBtn.textContent = currentSortOrder === 'asc' ? '▲' : '▼';
        }
    }
}

function setupModals() {
    // Закрытие всех модалок
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    function openModal(modalId) {
        closeAllModals();
        document.getElementById(modalId).style.display = 'block';
    }

    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeAllModals();
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

function showMessage(messageText, messageDate) {
    const messageDateElem = document.getElementById('messageDate');
    const messageTextElem = document.getElementById('messageText');

    const formattedDate = new Date(messageDate).toLocaleString('ru-RU');
    messageDateElem.textContent = formattedDate;
    messageTextElem.textContent = messageText;

    // Закрываем все модалки и открываем messageModal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.getElementById('messageModal').style.display = 'block';
}

function setupCreateTaskForm() {
    const form = document.getElementById('formTask');
    const resultElem = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            title: e.target.title.value,
            description: e.target.description.value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            resultElem.textContent = '';
            resultElem.style.display = 'block';

            if (result.success) {
                resultElem.textContent = result.message || 'Успешно';
                resultElem.style.color = '#28a745';
                resultElem.style.background = '#e6f4ea';
                resultElem.style.padding = '10px';
                resultElem.style.borderRadius = '5px';
                resultElem.style.marginTop = '10px';

                setTimeout(() => {
                    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
                    loadTasks();
                    resultElem.style.display = 'none';
                }, 1500);

            } else {
                resultElem.textContent = result.error || '❌ Ошибка';
                resultElem.style.color = '#dc3545';
                resultElem.style.background = '#fceaea';
                resultElem.style.padding = '10px';
                resultElem.style.borderRadius = '5px';
                resultElem.style.marginTop = '10px';
            }

        } catch (error) {
            resultElem.textContent = 'Ошибка сети: ' + error.message;
            resultElem.style.color = '#dc3545';
            resultElem.style.background = '#fceaea';
            resultElem.style.padding = '10px';
            resultElem.style.borderRadius = '5px';
            resultElem.style.marginTop = '10px';
        }
    });
}

let currentSortField = null;
let currentSortOrder = 'asc';

function sortTasks(field) {
    let dataToSort = tableFilters ? tableFilters.getFilteredData() : tasksData;

    if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortOrder = 'asc';
    }

    dataToSort.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];

        // Специальная логика для разных полей
        switch (field) {
            case 'id':
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
                break;

            case 'created_at':
            case 'update_at':
                aValue = aValue ? new Date(aValue) : new Date(0);
                bValue = bValue ? new Date(bValue) : new Date(0);
                break;

            case 'status_label':
                aValue = a.status_label || a.label || '';
                bValue = b.status_label || b.label || '';
                break;

            case 'has_message':
                aValue = !!(a.messages_text && a.messages_created_at);
                bValue = !!(b.messages_text && b.messages_created_at);
                break;

            default:
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
        }

        if (aValue > bValue) return currentSortOrder === 'asc' ? 1 : -1;
        if (aValue < bValue) return currentSortOrder === 'asc' ? -1 : 1;
        return 0;
    });

    renderTable(dataToSort);
}

document.addEventListener("DOMContentLoaded", async () => {
    tableFilters = initTasksFilters(renderTable);

    loadTasks();
    loadUserInfo();
    setupModals();
    setupCreateTaskForm();

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => sortTasks(btn.dataset.sort));
    });
});