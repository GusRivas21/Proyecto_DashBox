<?php

namespace App\Http\Requests;

use App\Models\Manager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        $driver = $this->route('driver');
        $user = $this->user();

        return $user->hasRole('manager')
            && Manager::whereKey($user->getKey())->where('zone_id', $driver->zone_id)->exists();
    }

    protected function prepareForValidation(): void
    {
        $document = $this->input('national_id');

        if (is_string($document) && preg_match('/^(\d{8})(\d)$/D', $document, $parts)) {
            $this->merge(['national_id' => $parts[1].'-'.$parts[2]]);
        }
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $driver = $this->route('driver');

        return [
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'national_id' => [
                'required', 'string', 'max:10',
                Rule::when($this->input('national_id') !== $driver->national_id, 'regex:/^\d{8}-\d$/D'),
            ],
            'license_number' => ['required', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:20', 'regex:/^(?=(?:\D*\d){8,15}\D*$)\+?[0-9() \-]+$/D'],
            'zone_id' => ['sometimes', 'required', 'integer', Rule::in([$driver->zone_id])],
            'manager_id' => ['required', 'integer'],
            'vehicle_id' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'national_id.regex' => 'Ingresá el documento con formato 00000000-0.',
            'phone.required' => 'Ingresá un teléfono.',
            'phone.regex' => 'Ingresá un teléfono válido de 8 a 15 dígitos.',
            'zone_id.in' => 'No se puede cambiar la zona del transportista.',
        ];
    }
}
