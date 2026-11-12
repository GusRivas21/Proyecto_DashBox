<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // El permiso ya se verifica en la ruta con can:companies.create
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'       => trim((string) $this->name),
            'legal_name' => trim((string) $this->legal_name),
            'tax_id'     => trim((string) $this->tax_id),
            'email'      => strtolower(trim((string) $this->email)),
            'phone'      => trim((string) $this->phone),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'legal_name' => ['required', 'string', 'max:150'],
            'tax_id'     => ['required', 'string', 'max:20', Rule::unique('companies', 'tax_id')],
            'email'      => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone'      => ['required', 'regex:/^[0-9\-\+\s]{8,20}$/'],
            'zone_id'    => [
                'required',
                'integer',
                Rule::exists('zones', 'id')->where('status', 'activo'),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'       => 'nombre',
            'legal_name' => 'razón social',
            'tax_id'     => 'NIT / documento',
            'email'      => 'correo',
            'phone'      => 'teléfono',
            'zone_id'    => 'distrito',
        ];
    }

    public function messages(): array
    {
        return [
            'required'       => 'El campo :attribute es obligatorio.',
            'tax_id.unique'  => 'Este NIT / documento ya pertenece a otra empresa.',
            'email.email'    => 'Ingresa un correo válido, por ejemplo empresa@ejemplo.com.',
            'email.unique'   => 'Este correo ya está registrado en el sistema.',
            'phone.regex'    => 'El teléfono solo debe contener números (8 a 20 dígitos).',
            'zone_id.exists' => 'El distrito seleccionado no es válido o está inactivo.',
        ];
    }
}