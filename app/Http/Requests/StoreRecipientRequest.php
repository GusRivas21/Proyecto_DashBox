<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipientRequest extends FormRequest
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
            'name'    => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'contact' => ['required', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del destinatario es obligatorio.',
            'name.string'   => 'El nombre del destinatario no es válido.',
            'name.max'      => 'El nombre no puede superar los 255 caracteres.',

            'address.required' => 'La dirección es obligatoria.',
            'address.string'   => 'La dirección no es válida.',
            'address.max'      => 'La dirección no puede superar los 500 caracteres.',

            'contact.required' => 'El contacto es obligatorio.',
            'contact.string'   => 'El contacto no es válido.',
            'contact.max'      => 'El contacto no puede superar los 50 caracteres.',
        ];
    }
}
