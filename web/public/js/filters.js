class TableFilters {
    constructor(options = {}) {
        this.tableId = options.tableId || 'tasksTable';
        this.filtersContainer = options.filtersContainer || '.filters';
        this.data = [];
        this.filteredData = [];
        this.availableStatuses = [];

        this.filtersConfig = options.filtersConfig || {
            status: {
                selector: '#statusFilter',
                field: 'status_label',
                type: 'exact'
            },
            dateFrom: {
                selector: '#dateFrom',
                field: 'created_at',
                type: 'dateFrom'
            },
            dateTo: {
                selector: '#dateTo',
                field: 'created_at',
                type: 'dateTo'
            }
        };

        this.onFilterChange = options.onFilterChange || null;
        this.renderFunction = options.renderFunction || null;

        this.init();
    }

    async init() {
        await this.loadStatuses();
        this.bindEvents();
        this.setupClearButton();
    }

    async loadStatuses() {
        try {
            const response = await fetch('/api/statuses');
            const data = await response.json();

            if (data.success) {
                this.availableStatuses = data.statuses;
                this.populateStatusFilter();
                console.log('Statuses loaded:', this.availableStatuses);
                return this.availableStatuses;
            } else {
                console.error('Ошибка загрузки статусов:', data.error);
                return [];
            }
        } catch (err) {
            console.error('Ошибка загрузки статусов:', err);
            return [];
        }
    }

    populateStatusFilter() {
        const statusFilter = document.getElementById('statusFilter');
        if (!statusFilter) return;

        const currentValue = statusFilter.value;

        statusFilter.innerHTML = '<option value="">Все статусы</option>';

        this.availableStatuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.label; // Используем label как значение
            option.textContent = status.label;
            statusFilter.appendChild(option);
        });

        if (currentValue) {
            statusFilter.value = currentValue;
        }
    }

    bindEvents() {
        Object.values(this.filtersConfig).forEach(filterConfig => {
            const element = document.querySelector(filterConfig.selector);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                console.log(`Bound event to filter: ${filterConfig.selector}`);
            }
        });
    }

    setupClearButton() {
        const clearBtn = document.querySelector('#clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        console.log('Tasks data for filtering:', data);
        this.applyFilters();
    }

    getFilteredData() {
        return this.filteredData;
    }

    applyFilters() {
        if (this.data.length === 0) return;

        let filtered = [...this.data];
        console.log('Starting filtering with tasks:', filtered);

        Object.values(this.filtersConfig).forEach(filterConfig => {
            const filterElement = document.querySelector(filterConfig.selector);
            if (!filterElement) return;

            const filterValue = filterElement.value;
            console.log(`Applying filter ${filterConfig.field} with value:`, filterValue);

            if (!filterValue) return;

            filtered = filtered.filter(item => {
                let itemValue = item[filterConfig.field];
                console.log(`Comparing: item.${filterConfig.field} = "${itemValue}" with filter value: "${filterValue}"`);

                switch (filterConfig.type) {
                    case 'exact':
                        return String(itemValue) === String(filterValue);

                    case 'dateFrom':
                        const itemDate = new Date(item[filterConfig.field].split(' ')[0]);
                        const fromDate = new Date(filterValue);
                        return itemDate >= fromDate;

                    case 'dateTo':
                        const itemDateTo = new Date(item[filterConfig.field].split(' ')[0]);
                        const toDate = new Date(filterValue);
                        return itemDateTo <= toDate;

                    case 'contains':
                        return item[filterConfig.field]?.toLowerCase().includes(filterValue.toLowerCase());

                    default:
                        return true;
                }
            });

            console.log(`After ${filterConfig.field} filter:`, filtered.length, 'tasks');
        });

        this.filteredData = filtered;

        if (this.onFilterChange) {
            this.onFilterChange(filtered);
        }

        if (this.renderFunction) {
            this.renderFunction(filtered);
        }

        this.updateFilterState();
    }

    clearFilters() {
        Object.values(this.filtersConfig).forEach(filterConfig => {
            const element = document.querySelector(filterConfig.selector);
            if (element) {
                element.value = '';
            }
        });

        this.applyFilters();
    }

    updateFilterState() {
        const clearBtn = document.querySelector('#clearFilters');
        if (!clearBtn) return;

        const hasActiveFilters = Object.values(this.filtersConfig).some(filterConfig => {
            const element = document.querySelector(filterConfig.selector);
            return element && element.value !== '';
        });

        if (hasActiveFilters) {
            clearBtn.style.opacity = '1';
            clearBtn.style.pointerEvents = 'all';
            clearBtn.disabled = false;
        } else {
            clearBtn.style.opacity = '0.6';
            clearBtn.style.pointerEvents = 'none';
            clearBtn.disabled = true;
        }
    }
}

function initTasksFilters(renderFunction) {
    return new TableFilters({
        tableId: 'tasksTable',
        filtersContainer: '.filters',
        filtersConfig: {
            status: {
                selector: '#statusFilter',
                field: 'status_label',
                type: 'exact'
            },
            dateFrom: {
                selector: '#dateFrom',
                field: 'created_at',
                type: 'dateFrom'
            },
            dateTo: {
                selector: '#dateTo',
                field: 'created_at',
                type: 'dateTo'
            }
        },
        onFilterChange: renderFunction,
        renderFunction: renderFunction
    });
}