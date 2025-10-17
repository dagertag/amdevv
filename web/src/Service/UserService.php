<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\User;
use App\Repository\userRepository;

class UserService
{
    public function __construct(private UserRepository $userRepository) {}

    public function authenticate(string $login, string $password): array
    {
        $user = $this->userRepository->findByLogin($login);

        if (!$user || !password_verify($password, $user->getPassword())) {
            return ['success' => false, 'error' => 'Неверные учетные данные'];
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user->getId();
        $_SESSION['login'] = $user->getLogin();
        $_SESSION['role'] = $user->getRole();

        return ['success' => true, 'message' => 'Вы успешно авторизировались'];
    }

    public function register(array $input): array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $exestinUser = $this->userRepository->findByLogin($input['login']);

        if ($exestinUser) {
            return ['succes' => false, 'error' => 'Пользователь c таким логином уже существует'];
        }

        $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);

        $newUser = new User(
            id: 0,
            username: $input['username'],
            login: $input['login'],
            password: $passwordHash,
            role: 'user'
        );

        $this->userRepository->createUser($newUser);

        $user = $this->userRepository->findByLogin($input['login']);
        $_SESSION['user_id'] = $user->getId();
        $_SESSION['login'] = $user->getLogin();
        $_SESSION['role'] = $user->getRole();

        return [
            'success' => true,
            'message' => 'Пользователь успешно зарегистрирован'
        ];
    }

    public function logout(): array
    {
        session_destroy();

        return ['success' => true];
    }
}
