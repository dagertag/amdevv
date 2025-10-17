<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Database;

if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$pdo = Database::getConnection();

$pdo->exec("
CREATE TABLE IF NOT EXISTS users
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    login    VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     ENUM ('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS statuses
(
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50),
    label VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS tasks
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id     INT NOT NULL,
    status_id   INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (status_id) REFERENCES statuses (id)
);

CREATE TABLE IF NOT EXISTS messages
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    task_id    INT  NOT NULL,
    user_id    INT  NOT NULL,
    text       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks_tags
(
    task_id INT NOT NULL,
    tag_id  INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
");

$users = [
    ['username' => 'admin', 'login' => 'admin', 'password' => 'admin', 'role' => 'admin'],
    ['username' => 'user',  'login' => 'user',  'password' => 'user',  'role' => 'user'],
];

$stmt = $pdo->prepare("INSERT INTO users (username, login, password, role) VALUES (:username, :login, :password, :role)");

foreach ($users as $user) {
    $stmt->execute([
        ':username' => $user['username'],
        ':login'    => $user['login'],
        ':password' => password_hash($user['password'], PASSWORD_DEFAULT),
        ':role'     => $user['role'],
    ]);
}

$statuses = [
    ['ToDo', 'Направлено на рассмотрение'],
    ['InProgress', 'В работе'],
    ['ReadyForReview', 'Готово к проверке'],
    ['Done', 'Выполнено']
];

$stmt = $pdo->prepare("INSERT INTO statuses (name, label) VALUES (:name, :label)");

foreach ($statuses as $status) {
    $stmt->execute([':name' => $status[0], ':label' => $status[1]]);
}

$stmt = $pdo->prepare("
INSERT INTO tasks (title, description, user_id, status_id)
VALUES (:title, :description, :user_id, :status_id)
");

$stmt->execute([
    ':title'       => 'Не работает кнопка просмотра ответа',
    ':description' => 'При нажатии на кнопку просмотра ответа модальное окно с деталями не открывается. Кнопка не реагирует, никаких ошибок в интерфейсе не отображается.',
    ':user_id'     => 2,
    ':status_id'   => 2,
]);

echo "Миграция выполнена успешно!";
