<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE contracts ADD CONSTRAINT chk_contracts_dates CHECK (end_date >= start_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
