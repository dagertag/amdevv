<?php

namespace App;

use App\Controller\TaskController;
use App\Controller\UserController;
use App\Controller\MessageController;
use App\Controller\TagController;
use App\Controller\StatusController;

class Router
{
    private $taskController;

    private $userController;

    private $messageController;

    private $tagController;

    private $statusController;

    public function __construct(
        TaskController $taskController,
        UserController $userController,
        MessageController $messageController,
        TagController $tagController,
        StatusController $statusController
    ) {
        $this->taskController = $taskController;
        $this->userController = $userController;
        $this->messageController = $messageController;
        $this->tagController = $tagController;
        $this->statusController = $statusController;
    }

    public function run(): void
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        if (strpos($path, '/api/') === 0) {
            $this->handleApi($path, $method);
            return;
        }
        $this->handlePage($path);
    }

    public function handleApi(string $path, string $method): void
    {
        header('Content-Type: application/json; charset=utf-8');
        session_start();

        $input = json_decode(file_get_contents('php://input'), true);

        try {
            switch (true) {
                case $path === '/api/auth' && $method === 'GET':
                    $this->checkAuth();
                    break;

                case $path === '/api/login' && $method === 'POST':
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->userController->login($input));
                    break;

                case $path === '/api/register' && $method === 'POST':
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->userController->register($input));
                    break;

                case $path === '/api/logout' && $method === 'POST':
                    echo json_encode($this->userController->logout());
                    break;

                case $path === '/api/tasks' && $method === 'GET':
                    $this->checkAuth();

                    if ($_SESSION['role'] === 'admin') {
                        echo json_encode($this->taskController->getAllTask());
                    } else {
                        echo json_encode($this->taskController->getUserTask($_SESSION['user_id']));
                    }
                    break;

                case
                    $path === '/api/tasks' && $method === 'POST':
                    $this->checkAuth();
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->taskController->createTask($input, $_SESSION['user_id']));
                    break;

                case $path === '/api/tasks/status' && $method === 'PUT':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->statusController->updateSratusToTask($input));
                    break;

                case $path === '/api/messages' && $method === 'POST':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->messageController->createMessage($input, $_SESSION['user_id']));
                    break;

                case $path === '/api/statuses' && $method === 'GET':
                    $this->checkAuth();
                    echo json_encode($this->statusController->getStatus());
                    break;

                case $path === '/api/statuses' && $method === 'POST':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->statusController->createStatus($input));
                    break;

                case $path === '/api/statuses' && $method === 'PUT':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    $statusId = $input['id'] ?? 0;
                    echo json_encode($this->statusController->updateStatus($statusId, $input));
                    break;

                case $path === '/api/statuses' && $method === 'DELETE':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    $statusId = $input['id'] ?? 0;
                    echo json_encode($this->statusController->deleteStatus($statusId));
                    break;

                case $path === '/api/tags' && $method === 'GET':
                    $this->checkAuth();
                    $this->checkAdmin();
                    echo json_encode($this->tagController->getTags());
                    break;

                case $path === '/api/tags' && $method === 'POST':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    echo json_encode($this->tagController->createTag($input));
                    break;

                case $path === '/api/tags' && $method === 'PUT':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    $tagId = $input['id'] ?? 0;
                    echo json_encode($this->tagController->updateTag($tagId, $input));
                    break;

                case $path === '/api/tags' && $method === 'DELETE':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);
                    $tagId = $input['id'] ?? 0;
                    echo json_encode($this->tagController->deleteTag($tagId));
                    break;

                case $path === '/api/tasks/addTags' && $method === 'PUT':
                    $this->checkAuth();
                    $this->checkAdmin();
                    $input = json_decode(file_get_contents('php://input'), true);

                    echo json_encode($this->tagController->addTagsToTask($input));
                    break;

                default:
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'API route not found']);
                    break;
            }
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
      }

    public function handlePage(string $path): void
    {
        session_start();

        switch ($path) {
            case '/':
            case '/index.php':
                header('Content-Type: text/html; charset=utf-8');
                readfile(__DIR__ . '/../public/index.html');
                break;

            case '/tasks':
            {
                if (!$this->isAuth()) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
                    break;
                }

                if ($_SESSION['role'] === 'admin') {
                    header('Content-Type: text/html; charset=utf-8');
                    readfile(__DIR__ . '/../public/admin.html');
                } else {
                    header('Content-Type: text/html; charset=utf-8');
                    readfile(__DIR__ . '/../public/task.html');
                }
                break;
            }

            case '/register':
                header('Content-Type: text/html; charset=utf-8');
                readfile(__DIR__ . '/../public/register.html');
                break;

            case '/login':
                header('Content-Type: text/html; charset=utf-8');
                readfile(__DIR__ . '/../public/login.html');
                break;
            case '/settings':
                header('Content-Type: text/html; charset=utf-8');
                readfile(__DIR__ . '/../public/settings.html');
                break;

            default:
                http_response_code(404);
                echo "404 — страница не найдена";
                break;
        }
    }

    private function checkAuth(): void
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
    }

    private function checkAdmin(): void
    {
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }

    private function isAuth(): bool
    {
        return isset($_SESSION['user_id']);
    }
}