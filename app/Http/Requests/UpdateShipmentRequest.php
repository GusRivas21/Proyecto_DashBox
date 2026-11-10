<?php

namespace App\Http\Requests;

use App\Models\Shipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShipmentRequest extends FormRequest
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
            'company_id' => ['sometimes', 'required', 'integer', 'exists:companies,id'],
            'recipient_id' => ['sometimes', 'required', 'integer', 'exists:recipients,id'],
            'manager_id' => ['sometimes', 'required', 'integer', 'exists:managers,id'],
            'driver_id' => ['sometimes', 'nullable', 'integer', 'exists:drivers,id'],
            'size' => ['sometimes', 'required', 'string', 'max:30'],
            'cargo_type' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', 'string', Rule::in(Shipment::STATUSES)],
        ];
    }
}
