<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateManagerRequest extends FormRequest
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
            'administrator_id' => ['sometimes', 'required', 'integer', 'exists:administrators,id'],
            'zone_id' => ['sometimes', 'required', 'integer', 'exists:zones,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:80'],
            'last_name' => ['sometimes', 'required', 'string', 'max:80'],
            'national_id' => ['sometimes', 'required', 'string', 'regex:/^\d{8}-\d$/', Rule::unique('managers', 'national_id')->ignore($this->route('manager'))],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
        ];
    }
}
