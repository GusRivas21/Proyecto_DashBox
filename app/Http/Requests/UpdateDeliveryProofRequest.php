<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryProofRequest extends FormRequest
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
            'proof_date' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
