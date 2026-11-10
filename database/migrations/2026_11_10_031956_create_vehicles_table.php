<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_id')->constrained('managers')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('plate', 15)->unique();
            $table->string('brand', 50);
            $table->string('model', 50);
            $table->unsignedSmallInteger('year');
            $table->decimal('capacity', 10, 2);
            $table->string('status', 20)->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
