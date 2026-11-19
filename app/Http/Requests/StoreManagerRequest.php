<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class StoreManagerRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'national_id' => ['required', 'string', 'regex:/^\d{8}-\d$/', Rule::unique('managers', 'national_id')],
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{8,20}$/'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()],
            'zone_id' => ['required', 'integer', 'exists:zones,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'first_name' => trim((string) $this->first_name),
            'last_name' => trim((string) $this->last_name),
            'national_id' => trim((string) $this->national_id),
            'phone' => trim((string) $this->phone),
            'email' => strtolower(trim((string) $this->email)),
        ]);
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'nombre',
            'last_name' => 'apellido',
            'national_id' => 'documento de identidad',
            'phone' => 'teléfono',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'zone_id' => 'zona o sucursal',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'national_id.regex' => 'Ingresa el documento con el formato 00000000-0.',
            'national_id.unique' => 'Este documento ya está asociado a otro usuario.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'email.unique' => 'Este correo ya está registrado en el sistema.',
            'phone.regex' => 'Ingresa un teléfono válido de 8 a 20 caracteres.',
            'zone_id.exists' => 'La zona seleccionada no es válida.',
        ];
    }
}
