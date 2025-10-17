<?php

declare(strict_types=1);

namespace App\Repository;

class TagRepository
{
    private $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findAll(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM tags ORDER BY name");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create(string $name): int
    {
        $stmt = $this->db->prepare("INSERT INTO tags (name) VALUES (:name)");
        $stmt->execute([':name' => $name]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, string $name): bool
    {
        $stmt = $this->db->prepare("UPDATE tags SET name = :name WHERE id = :id");
        return $stmt->execute([
            ':name' => $name,
            ':id' => $id
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM tags WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function isTagInUse(int $tagId): bool
    {
        $stmt = $this->db->prepare("SELECT task_id FROM tasks_tags WHERE tag_id = :tag_id LIMIT 1");
        $stmt->execute([':tag_id' => $tagId]);
        return (bool)$stmt->fetch();
    }

    public function exists(string $name): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM tags WHERE name = :name");
        $stmt->execute([':name' => $name]);
        return (bool)$stmt->fetch();
    }

    public function addTagsToTask(array $tags): bool
    {
        $deleteStmt = $this->db->prepare("DELETE FROM tasks_tags WHERE task_id = :task_id");
        $deleteStmt->execute([':task_id' => $tags['task_id']]);

        $stmt = $this->db->prepare(
            "INSERT INTO tasks_tags (task_id, tag_id) VALUES (:task_id, :tag_id)"
        );

        foreach ($tags['tag_id'] as $tag) {
            $stmt->bindParam(':task_id', $tags['task_id']);
            $stmt->bindParam(':tag_id', $tag);
            $stmt->execute();
        }

        $tagsStmt = $this->db->prepare(
            "SELECT tags.id, tags.name FROM tags
            INNER JOIN tasks_tags ON tasks_tags.tag_id = tags.id
            WHERE task_id = :task_id"
        );

        return $tagsStmt->execute([':task_id' => $tags['task_id']]);
    }
}