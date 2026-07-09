<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAiProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'provider' => ['sometimes', 'required', 'string', 'max:60'],
            'authType' => ['sometimes', 'required', 'string', 'max:60'],
            'model' => ['nullable', 'string', 'max:120'],
            'endpointUrl' => ['nullable', 'url', 'max:500'],
            'apiKey' => ['nullable', 'string', 'max:2000'],
            'quotaLimit' => ['nullable', 'integer', 'min:0'],
            'quotaUsed' => ['nullable', 'integer', 'min:0'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
