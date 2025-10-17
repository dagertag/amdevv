<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\MessageRepository;

class MessageService
{
    private $messageRepository;

    public function __construct(
        MessageRepository $messageRepository
    ) {
        $this->messageRepository = $messageRepository;
    }
    public function createMessage(array $message, int $userId): array
    {
        $result = $this->messageRepository->create($message, $userId);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Сообщие отправлено клиенту'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка отправки сообщения, обратитесь к амдинистратору'
            ];
        }
    }
}