<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipmentReturnRequest extends FormRequest
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
            'shipment_id' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipment_id.*' => 'Selecciona un envío válido.',
            'reason.required' => 'Indica el motivo de la devolución.',
            'reason.string' => 'Escribe el motivo de la devolución como texto.',
            'reason.max' => 'El motivo puede tener hasta 255 caracteres.',
        ];
    }
}
