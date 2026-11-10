<?php

namespace App\Http\Requests;

use App\Models\Shipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShipmentRequest extends FormRequest
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
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'recipient_id' => ['required', 'integer', Rule::exists('recipients', 'id')->where(fn ($query) => $query->where('company_id', $this->input('company_id')))],
            'manager_id' => ['required', 'integer', 'exists:managers,id'],
            'driver_id' => ['nullable', 'integer', 'exists:drivers,id'],
            'size' => ['required', 'string', 'max:30'],
            'cargo_type' => ['required', 'string', 'max:50'],
            'status' => ['sometimes', 'string', Rule::in(Shipment::STATUSES)],
        ];
    }
}
