<?php

namespace App\Services;

use App\Models\Recipient;
use DomainException;
use Illuminate\Pagination\LengthAwarePaginator;

class RecipientService
{
    public function paginate(int $companyId, array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? '';

        return Recipient::query()
            ->where('company_id', $companyId)
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(10);
    }

    public function findForCompany(int $id, int $companyId): Recipient
    {
        return Recipient::where('company_id', $companyId)->findOrFail($id);
    }

    public function register(array $data): Recipient
    {
        return Recipient::create($data);
    }

    public function update(int $id, int $companyId, array $data): Recipient
    {
        $recipient = $this->findForCompany($id, $companyId);
        $recipient->update($data);

        return $recipient;
    }

    public function delete(int $id, int $companyId): void
    {
        $recipient = $this->findForCompany($id, $companyId);

        if ($recipient->shipments()->exists()) {
            throw new DomainException('No se puede eliminar: el destinatario tiene órdenes de envío asociadas.');
        }

        $recipient->delete();
    }
}