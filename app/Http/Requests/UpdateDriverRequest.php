<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
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
            'vehicle_id' => ['sometimes', 'nullable', 'integer', 'exists:vehicles,id'],
            'zone_id' => ['sometimes', 'required', 'integer', 'exists:zones,id'],
            'manager_id' => ['sometimes', 'required', 'integer', 'exists:managers,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:80'],
            'last_name' => ['sometimes', 'required', 'string', 'max:80'],
            'national_id' => ['sometimes', 'required', 'string', 'regex:/^\d{8}-\d$/', Rule::unique('drivers', 'national_id')->ignore($this->route('driver'))],
            'license_number' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('drivers', 'license_number')->ignore($this->route('driver'))],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
        ];
    }
}
