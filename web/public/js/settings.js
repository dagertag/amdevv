const TAGS_API_URL = `${API_BASE_URL}/api/tags`;
const STATUSES_API_URL = `${API_BASE_URL}/api/statuses`;
let tagsData = [];
let statusesData = [];

async function loadTags() {
    try {
        const response = await fetch(TAGS_API_URL);
        const data = await response.json();

        if (!data.success) {
            showError('Ошибка загрузки тегов: ' + (data.error || 'Неизвестная ошибка'));
            return;
        }

        tagsData = data.tags || [];
        renderTagsTable(tagsData);

    } catch (err) {
        showError('Ошибка загрузки: ' + err.message);
    }
}

async function loadStatuses() {
    try {
        const response = await fetch(STATUSES_API_URL);
        const data = await response.json();

        if (!data.success) {
            showError('Ошибка загрузки статусов: ' + (data.error || 'Неизвестная ошибка'));
            return;
        }

        statusesData = data.statuses || [];
        renderStatusesTable(statusesData);

    } catch (err) {
        showError('Ошибка загрузки статусов: ' + err.message);
    }
}

function renderTagsTable(tags) {
    const tbody = document.getElementById('tagsList');
    tbody.innerHTML = '';

    if (tags.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Нет тегов</td></tr>';
        return;
    }

    tags.forEach(tag => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tag.id}</td>
            <td>${tag.name}</td>
            <td>
                <button class="btn-register-setting" onclick="editTag(${tag.id})">✏️</button>
                <button class="btn-register-setting" onclick="deleteTag(${tag.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderStatusesTable(statuses) {
    const tbody = document.getElementById('statusesList');
    tbody.innerHTML = '';

    if (statuses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Нет статусов</td></tr>';
        return;
    }

    statuses.forEach(status => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${status.id}</td>
            <td>${status.name}</td>
            <td>${status.label}</td>
            <td>
                <button class="btn-register-setting" onclick="editStatus(${status.id})">✏️</button>
                <button class="btn-register-setting" onclick="deleteStatus(${status.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function createTag() {
    document.getElementById('tagModalTitle').textContent = 'Создать тег';
    document.getElementById('tagId').value = '';
    document.getElementById('tagName').value = '';
    document.getElementById('tagModal').style.display = 'block';
}

function createStatus() {
    document.getElementById('statusModalTitle').textContent = 'Создать статус';
    document.getElementById('statusId').value = '';
    document.getElementById('statusName').value = '';
    document.getElementById('statusLabel').value = '';
    document.getElementById('statusModal').style.display = 'block';
}

function editTag(tagId) {
    const tag = tagsData.find(t => t.id === tagId);
    if (!tag) return;

    document.getElementById('tagModalTitle').textContent = 'Редактировать тег';
    document.getElementById('tagId').value = tag.id;
    document.getElementById('tagName').value = tag.name;
    document.getElementById('tagModal').style.display = 'block';
}

function editStatus(statusId) {
    const status = statusesData.find(s => s.id === statusId);
    if (!status) return;

    document.getElementById('statusModalTitle').textContent = 'Редактировать статус';
    document.getElementById('statusId').value = status.id;
    document.getElementById('statusName').value = status.name;
    document.getElementById('statusLabel').value = status.label;
    document.getElementById('statusModal').style.display = 'block';
}

async function deleteTag(tagId) {
    if (!confirm('Вы уверены, что хотите удалить этот тег?')) {
        return;
    }

    try {
        const requestBody = { id: tagId };

        const response = await fetch(TAGS_API_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Тег успешно удален');
            loadTags();
        } else {
            showError('Ошибка удаления: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        console.error('Delete error:', err);
        showError('Ошибка удаления: ' + err.message);
    }
}

async function deleteStatus(statusId) {
    if (!confirm('Вы уверены, что хотите удалить этот статус?')) {
        return;
    }

    try {
        const response = await fetch(STATUSES_API_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: statusId })
        });
        const data = await response.json();

        if (data.success) {
            showMessage('Статус успешно удален');
            loadStatuses();
        } else {
            showError('Ошибка удаления: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        showError('Ошибка удаления: ' + err.message);
    }
}

async function saveTag(event) {
    event.preventDefault();

    const tagId = document.getElementById('tagId').value;
    const name = document.getElementById('tagName').value.trim();

    if (!name) {
        showError('Введите название тега');
        return;
    }

    try {
        const url = tagId ? TAGS_API_URL : TAGS_API_URL;
        const method = tagId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: tagId,
                name: name
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(tagId ? 'Тег обновлен' : 'Тег создан');
            closeTagModal();
            loadTags();
        } else {
            showError('Ошибка сохранения: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        showError('Ошибка сохранения: ' + err.message);
    }
}

async function saveStatus(event) {
    event.preventDefault();

    const statusId = document.getElementById('statusId').value;
    const name = document.getElementById('statusName').value.trim();
    const label = document.getElementById('statusLabel').value.trim();

    if (!name || !label) {
        showError('Заполните все поля');
        return;
    }

    try {
        const url = statusId ? STATUSES_API_URL : STATUSES_API_URL;
        const method = statusId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: statusId,
                name: name,
                label: label
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(statusId ? 'Статус обновлен' : 'Статус создан');
            closeStatusModal();
            loadStatuses();
        } else {
            showError('Ошибка сохранения: ' + (data.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        showError('Ошибка сохранения: ' + err.message);
    }
}

function closeTagModal() {
    document.getElementById('tagModal').style.display = 'none';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

function showMessage(message) {
    alert(message);
}

function showError(message) {
    alert('Ошибка: ' + message);
}

document.addEventListener("DOMContentLoaded", () => {
    loadTags();
    loadStatuses();

    document.getElementById('createTagBtn').addEventListener('click', createTag);
    document.getElementById('tagForm').addEventListener('submit', saveTag);
    document.getElementById('tagCancelBtn').addEventListener('click', closeTagModal);
    document.querySelector('#tagModal .close').addEventListener('click', closeTagModal);

    document.getElementById('createStatusBtn').addEventListener('click', createStatus);
    document.getElementById('statusForm').addEventListener('submit', saveStatus);
    document.getElementById('statusCancelBtn').addEventListener('click', closeStatusModal);
    document.querySelector('#statusModal .close').addEventListener('click', closeStatusModal);

    window.addEventListener('click', (event) => {
        const tagModal = document.getElementById('tagModal');
        const statusModal = document.getElementById('statusModal');

        if (event.target === tagModal) closeTagModal();
        if (event.target === statusModal) closeStatusModal();
    });
});