<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->foreign('id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('administrator_id')->constrained('administrators')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('legal_name', 150);
            $table->string('name', 100);
            $table->string('tax_id', 20)->unique();
            $table->string('phone', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
