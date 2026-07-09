<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiProvider extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'provider',
        'auth_type',
        'model',
        'endpoint_url',
        'api_key',
        'status',
        'quota_limit',
        'quota_used',
        'quota_reset_at',
        'last_verified_at',
        'metadata',
    ];

    protected $hidden = ['api_key'];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'quota_limit' => 'integer',
            'quota_used' => 'integer',
            'quota_reset_at' => 'datetime',
            'last_verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function getQuotaRemainingAttribute(): ?int
    {
        if ($this->quota_limit === null) {
            return null;
        }

        return max($this->quota_limit - $this->quota_used, 0);
    }

    public function getApiKeyConfiguredAttribute(): bool
    {
        return filled($this->api_key);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
