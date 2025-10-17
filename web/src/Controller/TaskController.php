<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TaskService;

class TaskController
{
    private $taskService;

    public function __construct(
        TaskService $taskService
    ) {
        $this->taskService = $taskService;
    }

    public function getAllTask(): array
    {
        return $this->taskService->getAllTask();
    }

    public function getUserTask(int $id): array
    {
        return $this->taskService->getTaskById($id);
    }

    public function createTask(array $task, int $userId): array
    {
        if (empty($task['title']) || empty($task['description'])) {
            return ['success' => false, 'error' => 'Отсутствуют данные в одном из полей'];
        };

        return $this->taskService->createTask($task, $userId);
    }
}
