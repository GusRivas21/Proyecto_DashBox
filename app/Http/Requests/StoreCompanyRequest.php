<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyRequest extends FormRequest
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
            'zone_id' => ['required', 'integer', 'exists:zones,id'],
            'administrator_id' => ['required', 'integer', 'exists:administrators,id'],
            'legal_name' => ['required', 'string', 'max:150'],
            'name' => ['required', 'string', 'max:100'],
            'tax_id' => ['required', 'string', 'regex:/^\d{4}-\d{6}-\d{3}-\d$/', Rule::unique('companies', 'tax_id')],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
        ];
    }
}
