<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('recipient_id')->constrained('recipients')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('manager_id')->constrained('managers')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->cascadeOnUpdate()->nullOnDelete();
            $table->string('size', 30);
            $table->string('cargo_type', 50);
            $table->string('status', 30)->default('registered');
            $table->index('status');
            $table->index('driver_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
