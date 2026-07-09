<?php

use App\Http\Controllers\Api\AiProviderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:api')->prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/health', HealthController::class);
        Route::get('/settings/bootstrap', BootstrapController::class);

        Route::get('/ai-providers', [AiProviderController::class, 'index']);
        Route::post('/ai-providers', [AiProviderController::class, 'store']);
        Route::patch('/ai-providers/{aiProvider}', [AiProviderController::class, 'update']);
        Route::post('/ai-providers/{aiProvider}/verify', [AiProviderController::class, 'verify']);

        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/conversation-history', [ProjectController::class, 'history']);
    });
});
