<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_providers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('provider');
            $table->string('auth_type')->default('api_key');
            $table->string('model')->nullable();
            $table->string('endpoint_url')->nullable();
            $table->text('api_key')->nullable();
            $table->string('status')->default('unverified');
            $table->unsignedInteger('quota_limit')->nullable();
            $table->unsignedInteger('quota_used')->default(0);
            $table->timestamp('quota_reset_at')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['provider', 'status']);
        });

        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('status')->default('draft');
            $table->string('current_stage')->default('intake');
            $table->text('summary')->nullable();
            $table->json('stack_decision')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('conversation_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'created_at']);
        });

        Schema::create('system_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('group');
            $table->string('key');
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('ai_providers');
    }
};
