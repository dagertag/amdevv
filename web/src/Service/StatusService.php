<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\StatusRepository;

class StatusService
{
    private $statusRepository;

    public function __construct(
        statusRepository $statusRepository
    ) {
        $this->statusRepository = $statusRepository;
    }

    public function getStatus(): array
    {
        $tags = $this->statusRepository->getStatus();
        return [
            'success' => true,
            'statuses' => $tags,
        ];
    }

    public function createStatus(string $name, string $label): array
    {
        try {
            if (empty($name) || empty($label)) {
                return ['success' => false, 'error' => 'Заполните все поля'];
            }

            $statusId = $this->statusRepository->create($name, $label);

            return [
                'success' => true,
                'status_id' => $statusId,
                'message' => 'Статус успешно создан'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при создании статуса'
            ];
        }
    }

    public function updateStatus(int $id, string $name, string $label): array
    {
        try {
            if (empty($name) || empty($label)) {
                return ['success' => false, 'error' => 'Заполните все поля'];
            }

            $result = $this->statusRepository->update($id, $name, $label);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Статус успешно обновлен'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Статус не найден'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при обновлении статуса'
            ];
        }
    }

    public function deleteStatus(int $id): array
    {
        try {
            if ($this->statusRepository->isStatusInUse($id)) {
                return [
                    'success' => false,
                    'error' => 'Нельзя удалить статус, так как он используется в задачах'
                ];
            }

            $result = $this->statusRepository->delete($id);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Статус успешно удален'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Статус не найден'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при удалении статуса'
            ];
        }
    }

    public function updateSratusToTask(array $status): array
    {
        $result = $this->statusRepository->updateSratusToTask($status);

        try {
            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Статус успешно обновлен'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Статус не найден'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при обновлении статуса'
            ];
        }
    }
}