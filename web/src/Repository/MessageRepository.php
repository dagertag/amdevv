<?php

declare(strict_types=1);

namespace App\Repository;

class MessageRepository
{
    private $db;

    public function __construct(
        \PDO $db
    ) {
        $this->db = $db;
    }

    public function create(array $message, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO messages (task_id, user_id, text) VALUES (:task_id, :user_id, :text)"
        );
        $stmt->bindParam(':task_id', $message['task_id']);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->bindParam(':text', $message['message']);

        return $stmt->execute();
    }
}