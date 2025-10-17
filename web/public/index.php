<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Database;
use App\Router;
use App\Controller\MessageController;
use App\Controller\TagController;
use App\Controller\UserController;
use App\Repository\MessageRepository;
use App\Repository\TagRepository;
use App\Service\MessageService;
use App\Service\UserService;
use App\Service\TagService;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use App\Controller\TaskController;
use App\Repository\UserRepository;
use App\Repository\StatusRepository;
use App\Service\StatusService;
use App\Controller\StatusController;

$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$pdo = Database::getConnection();

$userRepository = new UserRepository($pdo);
$authService = new UserService($userRepository);
$authController = new UserController($authService);

$taskRepository = new TaskRepository($pdo);
$taskService = new TaskService($taskRepository);
$taskController = new TaskController($taskService);

$messageRepository = new MessageRepository($pdo);
$messageService = new MessageService($messageRepository);
$messageController = new MessageController($messageService);

$tagRepository = new TagRepository($pdo);
$tagService = new TagService($tagRepository);
$tagController = new TagController($tagService);

$statusRepository = new statusRepository($pdo);
$statusService = new statusService($statusRepository);
$statusController = new statusController($statusService);

$router = new Router(
    $taskController,
    $authController,
    $messageController,
    $tagController,
    $statusController
);

$router->run();

