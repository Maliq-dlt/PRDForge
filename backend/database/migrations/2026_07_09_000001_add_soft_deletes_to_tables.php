<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('ai_providers', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('conversation_messages', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('system_settings', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('conversation_messages', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('ai_providers', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
