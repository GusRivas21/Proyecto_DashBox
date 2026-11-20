<?php

namespace App\Services;

use App\Models\Manager;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ManagerService
{
    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return Manager::query()
            ->with([
                'user' => fn ($query) => $query->withTrashed()->select('id', 'name', 'email'),
                'zone:id,department,district',
            ])
            ->withTrashed()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate($perPage);
    }

    public function find(int $id): Manager
    {
        return Manager::withTrashed()
            ->with(['user' => fn ($query) => $query->withTrashed(), 'zone:id,department,district'])
            ->findOrFail($id);
    }

    public function update(int $id, array $data): Manager
    {
        return DB::transaction(function () use ($id, $data) {
            $manager = Manager::query()->findOrFail($id);
            $manager->update($data);
            $manager->user()->withTrashed()->firstOrFail()->update([
                'name' => $manager->first_name.' '.$manager->last_name,
            ]);

            return $manager->load(['user:id,name,email', 'zone:id,department,district']);
        });
    }

    public function deactivate(int $id): void
    {
        DB::transaction(function () use ($id) {
            $manager = Manager::query()->findOrFail($id);
            $manager->delete();
            $manager->user()->delete();
        });
    }

    public function register(array $data): Manager
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['first_name'].' '.$data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);
            $user->assignRole('manager');

            return Manager::create([
                'id' => $user->id,
                'administrator_id' => $data['administrator_id'],
                'zone_id' => $data['zone_id'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'national_id' => $data['national_id'],
                'phone' => $data['phone'],
            ]);
        });
    }
}
