<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\TaskRepository;

class TaskService
{
    private $taskRepository;

    public function __construct(
        TaskRepository $taskRepository
    ) {
        $this->taskRepository = $taskRepository;
    }

    public function getAllTask(): array
    {
        $tasks = $this->taskRepository->getAllTasks();

        return [
            'success' => true,
            'tasks' => $tasks
        ];
    }

    public function getTaskById(int $id): array
    {
        $tasks = $this->taskRepository->getUserTasks($id);

        return [
            'success' => true,
            'tasks' => $tasks
        ];
    }

    public function createTask(array $task, int $userId): array
    {
        $result = $this->taskRepository->createTask($task, $userId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Ваша заявка создана и отправлена на рассмотрение'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при создании задачи'
            ];
        }
    }
}