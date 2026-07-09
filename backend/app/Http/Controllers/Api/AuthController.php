<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Seed default AI providers for the new user
        $user->aiProviders()->createMany([
            [
                'provider' => 'openai',
                'name' => 'OpenAI GPT',
                'auth_type' => 'api_key',
                'model' => 'gpt-4.1-mini',
                'status' => 'unverified',
                'quota_limit' => 1000000,
                'quota_used' => 0,
                'metadata' => ['docs' => 'https://platform.openai.com/docs'],
            ],
            [
                'provider' => 'gemini',
                'name' => 'Gemini',
                'auth_type' => 'api_key',
                'model' => 'gemini-2.5-flash',
                'status' => 'unverified',
                'quota_limit' => 750000,
                'quota_used' => 0,
                'metadata' => ['docs' => 'https://ai.google.dev/'],
            ],
            [
                'provider' => 'local',
                'name' => 'Local LLM',
                'auth_type' => 'local_endpoint',
                'model' => 'llama-compatible',
                'endpoint_url' => 'http://127.0.0.1:11434/v1',
                'status' => 'verified',
                'last_verified_at' => now(),
                'quota_limit' => null,
                'quota_used' => 0,
                'metadata' => ['runtime' => 'OpenAI-compatible local endpoint'],
            ],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil keluar.',
        ]);
    }
}
