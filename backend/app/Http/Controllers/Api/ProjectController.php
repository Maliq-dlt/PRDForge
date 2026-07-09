<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\ConversationMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProjectResource::collection(
            $request->user()->projects()->withCount('messages')->latest('updated_at')->paginate(10),
        );
    }

    public function history(Request $request): JsonResponse
    {
        $messages = ConversationMessage::query()
            ->whereHas('project', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->with('project:id,name')
            ->latest('created_at')
            ->limit(24)
            ->get()
            ->map(fn (ConversationMessage $message) => [
                'id' => $message->id,
                'project' => [
                    'id' => $message->project?->id,
                    'name' => $message->project?->name,
                ],
                'role' => $message->role,
                'content' => str($message->content)->limit(180)->toString(),
                'createdAt' => optional($message->created_at)?->toIso8601String(),
            ]);

        return response()->json(['data' => $messages]);
    }
}
