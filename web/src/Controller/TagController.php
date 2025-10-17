<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TagService;

class TagController
{
    private $tagService;

    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    public function getTags(): array
    {
        return $this->tagService->getAllTags();
    }

    public function createTag(array $data): array
    {
        $name = $data['name'] ?? '';
        return $this->tagService->createTag($name);
    }

    public function updateTag(int $id, array $data): array
    {
        $name = $data['name'] ?? '';
        return $this->tagService->updateTag($id, $name);
    }

    public function deleteTag(int $id): array
    {
        return $this->tagService->deleteTag($id);
    }

    public function addTagsToTask(array $tags): array
    {
        return $this->tagService->addTagsToTask($tags);
    }
}