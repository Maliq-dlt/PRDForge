<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HealthCheckService;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(HealthCheckService $health): JsonResponse
    {
        $snapshot = $health->snapshot();

        return response()->json($snapshot, $snapshot['status'] === 'ok' ? 200 : 503);
    }
}
