<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
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
            'zone_id' => ['sometimes', 'required', 'integer', 'exists:zones,id'],
            'administrator_id' => ['sometimes', 'required', 'integer', 'exists:administrators,id'],
            'legal_name' => ['sometimes', 'required', 'string', 'max:150'],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'tax_id' => ['sometimes', 'required', 'string', 'regex:/^\d{4}-\d{6}-\d{3}-\d$/', Rule::unique('companies', 'tax_id')->ignore($this->route('company'))],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
        ];
    }
}
