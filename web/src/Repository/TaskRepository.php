<?php

declare(strict_types=1);

namespace App\Repository;

use PDO;

class TaskRepository
{
    private $db;

    public function __construct(
        \PDO $db
    ) {
        $this->db = $db;
    }

    public function getAllTasks(): array
    {
        $stmt = $this->db->query(
            "SELECT tasks.id, tasks.title, tasks.description, tasks.created_at, tasks.updated_at,    statuses.label AS status_label,
                   users.username, JSON_ARRAYAGG(tags.name) AS tag_names FROM tasks
                   INNER JOIN statuses ON tasks.status_id = statuses.id
                   INNER JOIN users ON tasks.user_id = users.id
                   LEFT JOIN tasks_tags ON tasks.id = tasks_tags.task_id
                   LEFT JOIN tags ON tasks_tags.tag_id = tags.id
                   GROUP BY tasks.id, tasks.title, tasks.description, tasks.created_at, tasks.updated_at, 
                   statuses.label, users.username
                   ORDER BY tasks.id DESC;"
        );
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserTasks(int $id): array
    {
        $stmt = $this->db->prepare(
            "SELECT tasks.id, tasks.created_at, tasks.updated_at, statuses.name, statuses.label AS status_label, 
                 tasks.description, messages.created_at AS messages_created_at, messages.text AS messages_text
                 FROM tasks
                 INNER JOIN statuses ON tasks.status_id = statuses.id
                 INNER JOIN users ON tasks.user_id = users.id
                 LEFT JOIN messages ON messages.task_id = tasks.id
                 WHERE tasks.user_id = :id"
        );
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createTask(array $task, int $userId): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO tasks (title, description, user_id) VALUES (:title, :description, :user_id)"
        );
        $stmt->bindParam(':title', $task['title']);
        $stmt->bindParam(':description', $task['description']);
        $stmt->bindParam(':user_id', $userId);

        return $stmt->execute();
    }
}