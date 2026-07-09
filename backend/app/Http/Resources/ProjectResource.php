<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'currentStage' => $this->current_stage,
            'summary' => $this->summary,
            'stackDecision' => $this->stack_decision ?? [],
            'metadata' => $this->metadata ?? [],
            'messageCount' => $this->whenCounted('messages'),
            'updatedAt' => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
