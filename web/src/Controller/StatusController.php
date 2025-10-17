<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\StatusService;

class StatusController
{
    private $statusService;

    public function __construct(
        StatusService $statusService
    ) {
        $this->statusService = $statusService;
    }

    public function getStatus(): array
    {
        return $this->statusService->getStatus();
    }

    public function createStatus(array $data): array
    {
        $name = $data['name'] ?? '';
        $label = $data['label'] ?? '';

        return $this->statusService->createStatus($name, $label);
    }

    public function updateStatus(int $id, array $data): array
    {
        $name = $data['name'] ?? '';
        $label = $data['label'] ?? '';

        return $this->statusService->updateStatus($id, $name, $label);
    }

    public function deleteStatus(int $id): array
    {
        return $this->statusService->deleteStatus($id);
    }

    public function updateSratusToTask(array $status): array
    {
        return $this->statusService->updateSratusToTask($status);
    }
}