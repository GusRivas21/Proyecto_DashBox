<?php

namespace App\Http\Requests;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
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
            'manager_id' => ['required', 'integer', 'exists:managers,id'],
            'plate' => ['required', 'string', 'max:15', Rule::unique('vehicles', 'plate')],
            'brand' => ['required', 'string', 'max:50'],
            'model' => ['required', 'string', 'max:50'],
            'year' => ['required', 'integer', 'between:1980,' . (date('Y') + 1)],
            'capacity' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'status' => ['sometimes', 'string', Rule::in(Vehicle::STATUSES)],
        ];
    }
}
