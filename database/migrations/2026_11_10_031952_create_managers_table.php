<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('administrator_id')->constrained('administrators')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('national_id', 10)->unique();
            $table->string('phone', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managers');
    }
};
