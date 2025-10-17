<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\MessageService;

class MessageController
{
    private $messageService;

    public function __construct(
        MessageService $messageService
    ) {
        $this->messageService = $messageService;
    }

    public function createMessage(array $message, int $userId): array
    {
        return $this->messageService->createMessage($message, $userId);
    }
}