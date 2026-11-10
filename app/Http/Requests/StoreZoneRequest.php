<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'department' => ['required', 'string', 'max:80'],
            'district' => ['required', 'string', 'max:80', Rule::unique('zones', 'district')->where(fn ($query) => $query->where('department', $this->input('department')))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
