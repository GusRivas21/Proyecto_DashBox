<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('department', 80);
            $table->string('municipality', 80);
            $table->string('district', 80);
            $table->unique(['department', 'municipality', 'district'], 'zones_hierarchy_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
