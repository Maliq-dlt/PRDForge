<?php

namespace App\Policies;

use App\Models\AiProvider;
use App\Models\User;

class AiProviderPolicy
{
    public function view(User $user, AiProvider $aiProvider): bool
    {
        return $user->id === $aiProvider->user_id;
    }

    public function update(User $user, AiProvider $aiProvider): bool
    {
        return $user->id === $aiProvider->user_id;
    }

    public function delete(User $user, AiProvider $aiProvider): bool
    {
        return $user->id === $aiProvider->user_id;
    }
}
