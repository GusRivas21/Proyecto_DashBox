<?php

namespace App\Http\Requests;

use App\Models\Contract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'company_id' => [
                'required',
                'integer',
                Rule::exists('companies', 'id')->whereNull('deleted_at'),
            ],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after:start_date'],
            'amount'     => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
        ];
    }

    public function attributes(): array
    {
        return [
            'company_id' => 'empresa',
            'start_date' => 'fecha de inicio',
            'end_date'   => 'fecha de vencimiento',
            'amount'     => 'monto',
        ];
    }

    public function messages(): array
    {
        return [
            'required'         => 'El campo :attribute es obligatorio.',
            'company_id.exists' => 'La empresa seleccionada no es válida o está dada de baja.',
            'end_date.after'   => 'La fecha de vencimiento debe ser posterior a la de inicio.',
            'amount.min'       => 'El monto debe ser mayor que cero.',
        ];
    }
}
