<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\UserService;

class UserController
{
    private $authService;

    public function __construct(
        UserService $authService
    ) {
        $this->authService = $authService;
    }

    public function register($input): array
    {
        if (empty($input['username']) || empty($input['password'])) {
            return ['success' => false, 'error' => 'Заполните все поля'];
        }

        return $this->authService->register($input);
    }

    public function login(array $input): array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($input['login']) || empty($input['password'])) {
            return ['success' => false, 'error' => 'Не заполнен логин или пароль'];
        }

        return $this->authService->authenticate($input['login'], $input['password']);
    }

    public function logout(): array
    {
        return $this->authService->logout();
    }
}