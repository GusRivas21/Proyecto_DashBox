<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecipientRequest;
use App\Http\Requests\UpdateRecipientRequest;
use App\Services\RecipientService;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class RecipientController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:recipients.view', only: ['index']),
            new Middleware('can:recipients.create', only: ['create', 'store']),
            new Middleware('can:recipients.update', only: ['edit', 'update']),
            new Middleware('can:recipients.delete', only: ['destroy']),
        ];
    }

    public function index(Request $request, RecipientService $service)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
        ];

        $recipients = $service->paginate($request->user()->company_id, $filters)
            ->withQueryString()
            ->through(fn ($r) => [
                'id'      => $r->id,
                'name'    => $r->name,
                'address' => $r->address,
                'contact' => $r->contact,
            ]);

        return Inertia::render('recipients/index', [
            'recipients' => $recipients,
            'filters'    => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('recipients/create');
    }

    public function store(StoreRecipientRequest $request, RecipientService $service)
    {
        try {
            $service->register([
                ...$request->validated(),
                'company_id' => $request->user()->company_id,
            ]);

            return redirect()
                ->route('recipients.index')
                ->with('success', 'Destinatario registrado correctamente.');

        } catch (\Exception $e) {

            report($e);

            return redirect()
                ->back()
                ->with('error', 'No se pudo registrar el destinatario. Inténtalo nuevamente.')
                ->withInput();
        }
    }

    public function edit(Request $request, int $recipient, RecipientService $service)
    {
        $recipient = $service->findForCompany($recipient, $request->user()->company_id);

        return Inertia::render('recipients/edit', [
            'recipient' => $recipient->only('id', 'name', 'address', 'contact'),
        ]);
    }

    public function update(UpdateRecipientRequest $request, int $recipient, RecipientService $service)
    {
        try {
            $service->update($recipient, $request->user()->company_id, $request->validated());

            return redirect()
                ->route('recipients.index')
                ->with('success', 'Destinatario actualizado correctamente.');

        } catch (\Exception $e) {

            report($e);

            return redirect()
                ->back()
                ->with('error', 'No se pudo actualizar el destinatario. Inténtalo nuevamente.')
                ->withInput();
        }
    }

    public function destroy(Request $request, int $recipient, RecipientService $service)
    {
        try {
            $service->delete($recipient, $request->user()->company_id);

            return redirect()
                ->route('recipients.index')
                ->with('success', 'Destinatario eliminado correctamente.');

        } catch (DomainException $e) {

            return redirect()
                ->route('recipients.index')
                ->with('error', $e->getMessage());
        }
    }
}