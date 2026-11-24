<?php

namespace App\Http\Requests;

use App\Models\Shipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // el acceso lo controla el middleware can:shipments.edit
    }

    public function rules(): array
    {
        return [
            'recipient_id' => [
                'required',
                'integer',
                Rule::exists('recipients', 'id')->where('company_id', $this->user()->id),
            ],
            'size'       => ['required', Rule::in(Shipment::SIZES)],
            'cargo_type' => ['required', Rule::in(Shipment::CARGO_TYPES)],
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_id.required' => 'Debes seleccionar un destinatario para guardar el envío.',
            'recipient_id.integer'  => 'El destinatario no es válido.',
            'recipient_id.exists'   => 'El destinatario seleccionado no existe o no pertenece a tu empresa.',

            'size.required' => 'Debes clasificar el tamaño del pedido.',
            'size.in'       => 'El tamaño debe ser pequeño, mediano o grande.',

            'cargo_type.required' => 'Debes indicar la naturaleza del paquete.',
            'cargo_type.in'       => 'La naturaleza del paquete debe ser frágil, neutro o pesado.',
        ];
    }
}