<?php

namespace App\Http\Requests;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
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
            'manager_id' => ['sometimes', 'required', 'integer', 'exists:managers,id'],
            'plate' => ['sometimes', 'required', 'string', 'max:15', Rule::unique('vehicles', 'plate')->ignore($this->route('vehicle'))],
            'brand' => ['sometimes', 'required', 'string', 'max:50'],
            'model' => ['sometimes', 'required', 'string', 'max:50'],
            'year' => ['sometimes', 'required', 'integer', 'between:1980,' . (date('Y') + 1)],
            'capacity' => ['sometimes', 'required', 'numeric', 'gt:0', 'max:99999999.99'],
            'status' => ['sometimes', 'string', Rule::in(Vehicle::STATUSES)],
        ];
    }
}
