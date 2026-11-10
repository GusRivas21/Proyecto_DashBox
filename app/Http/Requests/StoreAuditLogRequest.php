<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAuditLogRequest extends FormRequest
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
            'shipment_id' => ['required', 'integer', 'exists:shipments,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'logged_at' => ['nullable', 'date'],
            'change_description' => ['required', 'string', 'max:255'],
        ];
    }
}
