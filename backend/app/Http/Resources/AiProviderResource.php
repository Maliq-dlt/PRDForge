<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'provider' => $this->provider,
            'authType' => $this->auth_type,
            'model' => $this->model,
            'endpointUrl' => $this->endpoint_url,
            'status' => $this->status,
            'apiKeyConfigured' => $this->api_key_configured,
            'quota' => [
                'limit' => $this->quota_limit,
                'used' => $this->quota_used,
                'remaining' => $this->quota_remaining,
                'resetAt' => optional($this->quota_reset_at)?->toIso8601String(),
            ],
            'lastVerifiedAt' => optional($this->last_verified_at)?->toIso8601String(),
            'metadata' => $this->metadata ?? [],
            'updatedAt' => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
