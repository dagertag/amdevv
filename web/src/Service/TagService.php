<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\TagRepository;

class TagService
{
    private $tagRepository;

    public function __construct(TagRepository $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    public function getAllTags(): array
    {
        try {
            $tags = $this->tagRepository->findAll();
            return [
                'success' => true,
                'tags' => $tags,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при получении тегов'
            ];
        }
    }

    public function createTag(string $name): array
    {
        try {
            if (empty($name)) {
                return ['success' => false, 'error' => 'Введите название тега'];
            }

            // Проверка на дубликат
            if ($this->tagRepository->exists($name)) {
                return ['success' => false, 'error' => 'Тег с таким названием уже существует'];
            }

            $tagId = $this->tagRepository->create($name);

            return [
                'success' => true,
                'tag_id' => $tagId,
                'message' => 'Тег успешно создан'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при создании тега'
            ];
        }
    }

    public function updateTag(int $id, string $name): array
    {
        try {
            if (empty($name)) {
                return ['success' => false, 'error' => 'Введите название тега'];
            }

            $result = $this->tagRepository->update($id, $name);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Тег успешно обновлен'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Тег не найден'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при обновлении тега'
            ];
        }
    }

    public function deleteTag(int $id): array
    {
        try {
            if ($this->tagRepository->isTagInUse($id)) {
                return [
                    'success' => false,
                    'error' => 'Нельзя удалить тег, так как он используется в задачах'
                ];
            }

            $result = $this->tagRepository->delete($id);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Тег успешно удален'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Тег не найден'
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Ошибка при удалении тега'
            ];
        }
    }

    public function addTagsToTask(array $tags): array
    {
        if (empty($tags['tag_id']) || empty($tags['task_id'])) {
            return ['succes' => false, 'error' => 'Отсутствую данные'];
        }

        $result = $this->tagRepository->addTagsToTask($tags);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Теги успешно добавлены'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Произошла ошибка. Обратитесь в службу поддержки'
            ];
        }
    }
}