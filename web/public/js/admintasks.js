const API_URL = `${API_BASE_URL}/api/tasks`;
let tasksData = [];
let currentTaskTagsState = {};
let availableStatuses = [];
let tableFilters = null;

function parseTagNames(tagNamesString) {
    if (!tagNamesString || tagNamesString === '[null]') {
        return [];
    }
    try {
        const parsed = JSON.parse(tagNamesString);
        return Array.isArray(parsed) ? parsed.filter(name => name !== null) : [];
    } catch (e) {
        console.error('Ошибка парсинга тегов:', e, tagNamesString);
        return [];
    }
}

async function loadStatuses() {
    try {
        const response = await fetch('/api/statuses');
        const data = await response.json();

        if (data.success) {
            availableStatuses = data.statuses;
            populateStatusFilter();
            return availableStatuses;
        } else {
            console.error('Ошибка загрузки статусов:', data.error);
            return [];
        }
    } catch (err) {
        console.error('Ошибка загрузки статусов:', err);
        return [];
    }
}

function populateStatusFilter() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) return;

    const currentValue = statusFilter.value;

    statusFilter.innerHTML = '<option value="">Все статусы</option>';

    availableStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.label;
        statusFilter.appendChild(option);
    });

    if (currentValue) {
        statusFilter.value = currentValue;
    }
}

async function sendReplyMessage(taskId, messageText, replyStatus, replyText) {
    if (!messageText.trim()) {
        replyStatus.textContent = '❌ Введите текст сообщения';
        replyStatus.style.color = '#dc3545';
        setTimeout(() => {
            replyStatus.textContent = '';
        }, 3000);
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_id: taskId,
                message: messageText.trim()
            })
        });

        const result = await response.json();

        if (result.success) {
            replyStatus.textContent = '✅ Ответ отправлен';
            replyStatus.style.color = '#28a745';
            replyText.value = '';
        } else {
            replyStatus.textContent = '❌ Ошибка: ' + (result.error || 'Не удалось отправить');
            replyStatus.style.color = '#dc3545';
        }

        setTimeout(() => {
            replyStatus.textContent = '';
        }, 3000);

    } catch (err) {
        replyStatus.textContent = '❌ Ошибка соединения: ' + err.message;
        replyStatus.style.color = '#dc3545';
        setTimeout(() => {
            replyStatus.textContent = '';
        }, 3000);
    }
}

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

function setupModals() {
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    function openModal(modalId) {
        closeAllModals();
        document.getElementById(modalId).style.display = 'block';
    }

    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    return { openModal, closeAllModals };
}

function setupTagsSystem(availableTags, currentTaskTagNames, taskId, container) {
    const selectedTagsContainer = container.querySelector('.selected-tags');
    const availableTagsContainer = container.querySelector('.available-tags');
    const saveTagsBtn = container.querySelector('.save-tags-btn');
    const tagsMsg = container.querySelector('.tags-msg');

    let selectedTags, availableTagsList;

    if (currentTaskTagsState[taskId]) {
        selectedTags = [...currentTaskTagsState[taskId].selectedTags];
        availableTagsList = [...currentTaskTagsState[taskId].availableTagsList];
    } else {
        selectedTags = currentTaskTagNames.map(tagName => {
            const tag = availableTags.find(t => t.name === tagName);
            return tag || { id: 0, name: tagName };
        }).filter(tag => tag !== null);

        availableTagsList = availableTags.filter(tag =>
            !currentTaskTagNames.includes(tag.name)
        );

        currentTaskTagsState[taskId] = {
            selectedTags: [...selectedTags],
            availableTagsList: [...availableTagsList]
        };
    }

    function renderTags() {
        // Очищаем контейнеры
        selectedTagsContainer.innerHTML = '';
        availableTagsContainer.innerHTML = '';

        if (selectedTags.length === 0) {
            selectedTagsContainer.innerHTML = '<div class="empty-state">Перетащите теги сюда или кликните на них</div>';
        } else {
            selectedTags.forEach(tag => {
                const tagElement = createTagElement(tag, 'selected');
                selectedTagsContainer.appendChild(tagElement);
            });
        }

        if (availableTagsList.length === 0) {
            availableTagsContainer.innerHTML = '<div class="empty-state">Все теги выбраны</div>';
        } else {
            availableTagsList.forEach(tag => {
                const tagElement = createTagElement(tag, 'available');
                availableTagsContainer.appendChild(tagElement);
            });
        }
    }

    function createTagElement(tag, type) {
        const tagElement = document.createElement('div');
        tagElement.className = `tag-item ${type}`;
        tagElement.setAttribute('data-tag-id', tag.id);

        if (type === 'selected') {
            tagElement.innerHTML = `
                ${tag.name}
                <button class="tag-remove" title="Удалить">×</button>
            `;

            tagElement.querySelector('.tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                moveTag(tag, 'available');
            });
        } else {
            tagElement.textContent = tag.name;

            tagElement.addEventListener('click', () => {
                moveTag(tag, 'selected');
            });
        }

        return tagElement;
    }

    function moveTag(tag, toContainer) {
        if (toContainer === 'selected') {
            // Добавляем в выбранные
            selectedTags.push(tag);
            availableTagsList = availableTagsList.filter(t => t.id !== tag.id);
        } else {
            // Возвращаем в доступные
            availableTagsList.push(tag);
            selectedTags = selectedTags.filter(t => t.id !== tag.id);
        }

        currentTaskTagsState[taskId] = {
            selectedTags: [...selectedTags],
            availableTagsList: [...availableTagsList]
        };

        renderTags();
    }

    saveTagsBtn.addEventListener('click', async () => {
        const selectedTagIds = selectedTags.map(tag => tag.id).filter(id => id !== 0);

        try {
            const resp = await fetch(`/api/tasks/addTags`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    task_id: taskId,
                    tag_id: selectedTagIds
                })
            });

            const result = await resp.json();
            if (result.success) {
                tagsMsg.textContent = "✅ Теги успешно обновлены";
                tagsMsg.style.color = '#28a745';
                setTimeout(() => tagsMsg.textContent = "", 3000);

                const taskIndex = tasksData.findIndex(t => t.id == taskId);
                if (taskIndex !== -1) {
                    // Создаем новый массив названий тегов из результата
                    const newTagNames = result.tags ? result.tags.map(tag => tag.name) : [];
                    tasksData[taskIndex].tag_names = JSON.stringify(newTagNames);

                    renderTable(tasksData);
                }

                if (result.tags) {
                    const newSelectedTags = result.tags.map(tag => {
                        const fullTag = availableTags.find(t => t.id === tag.id) || tag;
                        return fullTag;
                    });
                    const newAvailableTagsList = availableTags.filter(tag =>
                        !newSelectedTags.some(selected => selected.id === tag.id)
                    );

                    currentTaskTagsState[taskId] = {
                        selectedTags: newSelectedTags,
                        availableTagsList: newAvailableTagsList
                    };

                    selectedTags = newSelectedTags;
                    availableTagsList = newAvailableTagsList;
                    renderTags();
                }

            } else {
                tagsMsg.textContent = "❌ Ошибка: " + (result.error || "Не удалось обновить теги");
                tagsMsg.style.color = '#dc3545';
            }
        } catch (err) {
            tagsMsg.textContent = "❌ Ошибка соединения";
            tagsMsg.style.color = '#dc3545';
        }
    });

    renderTags();
}

async function renderModalInfo(task, containerElement) {
    containerElement.innerHTML = '';

    if (!task) {
        containerElement.innerHTML = '<p>Задача не найдена</p>';
        return;
    }

    let allTags = [];
    try {
        const tagsResp = await fetch('/api/tags');
        const tagsData = await tagsResp.json();
        if (tagsData.success) {
            allTags = tagsData.tags;
        }
    } catch (err) {
        console.error("Ошибка загрузки тегов", err);
    }

    const taskTagNames = parseTagNames(task.tag_names);

    const taskItem = document.createElement('div');

    taskItem.innerHTML = `
        <h3>Детали обращения #${task.id}</h3>
        <p><strong>Клиент:</strong> ${task.username}</p>
        <p><strong>Задача:</strong> ${task.title}</p>
        <p><strong>Описание:</strong> ${task.description ?? '—'}</p>
        <p><strong>Создана:</strong> ${task.created_at.split(' ')[0]}</p>
        <p><strong>Статус:</strong> <span class="task-status-label">${task.status_label ?? '—'}</span></p>
        <button class="change-status-link">Изменить статус</button>
        <div class="status-change-section" style="display:none; margin-top:10px;">
            <select class="status-select"></select>
            <button class="save-status-btn">Сохранить</button>
            <span class="status-change-msg" style="margin-left:10px;"></span>
        </div>
         
                <div class="tags-section" style="margin-top:15px;">
            <strong>Теги:</strong>
            <div class="tags-system">
                <div class="selected-tags">
                    <div class="empty-state">Загрузка тегов...</div>
                </div>
                <div class="available-tags">
                    <div class="empty-state">Загрузка тегов...</div>
                </div>
                <div class="tags-controls">
                    <button class="save-tags-btn">Сохранить теги</button>
                    <span class="tags-msg"></span>
                </div>
            </div>
        </div>
      
        <div style="margin-top:10px;">
            <button class="reply-btn">Оставить ответ</button>
        </div>
        <div class="reply-section" aria-hidden="true">
            <form class="reply-form" data-task-id="${task.id}" style="margin-top:10px;">
                <textarea name="message" placeholder="Введите ваш ответ..."></textarea>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <button type="submit" class="send-reply-btn">Отправить</button>
                </div>
            </form>
            <div class="reply-status" aria-live="polite"></div>
        </div>
    `;

    containerElement.appendChild(taskItem);

    const changeStatusLink = taskItem.querySelector('.change-status-link');
    const statusSection = taskItem.querySelector('.status-change-section');
    const statusSelect = taskItem.querySelector('.status-select');
    const saveStatusBtn = taskItem.querySelector('.save-status-btn');
    const statusMsg = taskItem.querySelector('.status-change-msg');
    const statusLabel = taskItem.querySelector('.task-status-label');

    const replyBtn = taskItem.querySelector('.reply-btn');
    const replySection = taskItem.querySelector('.reply-section');
    const replyForm = taskItem.querySelector('.reply-form');
    const replyText = replyForm.querySelector('textarea');
    const replyStatus = taskItem.querySelector('.reply-status');

    availableStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.label;
        if (status.id === task.status_id) option.selected = true;
        statusSelect.appendChild(option);
    });

    setupTagsSystem(allTags, taskTagNames, task.id, taskItem);

    changeStatusLink.addEventListener('click', (e) => {
        e.preventDefault();
        statusSection.style.display = statusSection.style.display === 'none' ? 'block' : 'none';
    });

    saveStatusBtn.addEventListener('click', async () => {
        const newStatusId = statusSelect.value;
        try {
            const resp = await fetch(`/api/tasks/status`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    task_id: task.id,
                    status_id: newStatusId
                })
            });
            const result = await resp.json();
            if (result.success) {
                const newStatus = availableStatuses.find(s => s.id == newStatusId);
                if (newStatus) {
                    statusLabel.textContent = newStatus.label;
                    // Обновляем данные в tasksData
                    const taskIndex = tasksData.findIndex(t => t.id == task.id);
                    if (taskIndex !== -1) {
                        tasksData[taskIndex].status_label = newStatus.label;
                        tasksData[taskIndex].status_id = newStatusId;
                    }
                }
                statusMsg.textContent = '✅ Статус изменён';
                statusMsg.style.color = '#28a745';
                setTimeout(() => {
                    statusMsg.textContent = '';
                    statusSection.style.display = 'none';
                }, 2000);
            } else {
                statusMsg.textContent = '❌ Ошибка: ' + (result.error || 'Не удалось изменить статус');
                statusMsg.style.color = '#dc3545';
            }
        } catch (err) {
            statusMsg.textContent = 'Ошибка соединения';
            statusMsg.style.color = '#dc3545';
        }
    });

    replyBtn.addEventListener('click', () => {
        const isExpanded = replySection.classList.toggle('expanded');
        replySection.setAttribute('aria-hidden', String(!isExpanded));
        replyBtn.textContent = isExpanded ? 'Скрыть форму' : 'Оставить ответ';
        if (isExpanded) setTimeout(() => replyText.focus(), 200);
    });

    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = replyText.value;
        await sendReplyMessage(replyForm.dataset.taskId, messageText, replyStatus, replyText);
    });
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
        const statusName = task.status_label || 'Неизвестный статус';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.username}</td>
            <td>${task.title}</td>
            <td>${createdDate}</td>
            <td>${statusName}</td>
            <td><a href="#" class="task-details-link" data-task-id="${task.id}">👁️</a></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.task-details-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const taskId = link.getAttribute('data-task-id');
            const task = tasksData.find(t => t.id == taskId);
            if (task) {
                renderModalInfo(task, document.getElementById('modal-body-container'));
                modals.openModal('taskDetailsModal');
            }
        });
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

        switch (field) {
            case 'id':
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
                break;

            case 'username':
                aValue = a.username || '';
                bValue = b.username || '';
                break;

            case 'created_at':
                aValue = aValue ? new Date(aValue) : new Date(0);
                bValue = bValue ? new Date(bValue) : new Date(0);
                break;

            case 'status_label':
                aValue = a.status_label || '';
                bValue = b.status_label || '';
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

let modals;

document.addEventListener("DOMContentLoaded", async () => {
    modals = setupModals();

    await loadStatuses();

    tableFilters = initTasksFilters(renderTable);

    await loadTasks();

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => sortTasks(btn.dataset.sort));
    });
});