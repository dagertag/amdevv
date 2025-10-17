<?php

declare(strict_types=1);

namespace App\Repository;

use PDO;

class StatusRepository
{
    private $db;

    public function __construct(
        \PDO $db
    ) {
        $this->db = $db;
    }

    public function getStatus(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM statuses");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(string $name, string $label): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO statuses (name, label) VALUES (:name, :label)"
        );
        $stmt->execute([
            ':name' => $name,
            ':label' => $label
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, string $name, string $label): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE statuses SET name = :name, label = :label WHERE id = :id"
        );
        return $stmt->execute([
            ':name' => $name,
            ':label' => $label,
            ':id' => $id
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM statuses WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function isStatusInUse(int $statusId): bool
    {
        $stmt = $this->db->prepare(
            "SELECT id FROM tasks WHERE status_id = :status_id LIMIT 1"
        );
        $stmt->execute([':status_id' => $statusId]);
        return (bool)$stmt->fetch();
    }

    public function updateSratusToTask(array $status): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE tasks SET status_id = :status_id WHERE id = :task_id"
        );
        return $stmt->execute([
            ':status_id' => $status['status_id'],
            ':task_id' => $status['task_id'],
        ]);

    }
}
