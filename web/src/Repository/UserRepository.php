<?php

declare(strict_types=1);

namespace App\Repository;

use PDO;
use App\Model\User;

class UserRepository
{
    public function __construct(private PDO $pdo) {}

    public function findByLogin(string $login): ?User
    {
        $stmt = $this->pdo->prepare("SELECT id, username, login, password, role FROM users WHERE login = :login");
        $stmt->execute(['login' => $login]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        return new User(
            (int)$data['id'],
            $data['username'],
            $data['login'],
            $data['password'],
            $data['role']
        );
    }

    public function createUser(User $user): bool
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (username, login, password) 
            VALUES (:username, :login, :password)");
        $stmt->bindValue(':username', $user->getUsername());
        $stmt->bindValue(':login', $user->getLogin());
        $stmt->bindValue(':password', $user->getPassword());

        return $stmt->execute();
    }
}
