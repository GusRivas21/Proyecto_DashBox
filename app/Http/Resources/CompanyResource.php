<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'legal_name' => $this->legal_name,
            'tax_id'     => $this->tax_id,
            'phone'      => $this->phone,
            'zone'       => $this->whenLoaded('zone', fn () => [
                'department' => $this->zone->department,
                'district'   => $this->zone->district,
            ]),
        ];
    }
}
