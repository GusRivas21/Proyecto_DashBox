<?php

namespace App\Http\Requests;

use App\Models\ShipmentReturn;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShipmentReturnRequest extends FormRequest
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
            'shipment_id' => ['sometimes', 'required', 'integer', 'exists:shipments,id'],
            'return_date' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'reason' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(ShipmentReturn::STATUSES)],
        ];
    }
}
