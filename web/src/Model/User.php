<?php

declare(strict_types=1);

namespace App\Model;

class User
{
    public function __construct(
        private int $id,
        private string $username,
        private string $login,
        private string $password,
        private string $role
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getLogin(): string
    {
        return $this->login;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'login' => $this->login,
            'role' => $this->role
        ];
    }
}
