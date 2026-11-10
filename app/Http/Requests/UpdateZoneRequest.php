<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateZoneRequest extends FormRequest
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
            'department' => ['sometimes', 'required', 'string', 'max:80'],
            'district' => ['sometimes', 'required', 'string', 'max:80', Rule::unique('zones', 'district')->where(fn ($query) => $query->where('department', $this->input('department')))->ignore($this->route('zone'))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
