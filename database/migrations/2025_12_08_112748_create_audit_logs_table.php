<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

    Schema::create('audit_logs', function (Blueprint $table) {
        $table->string('id')->primary();
        $table->string('user_id')->nullable();
        $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        $table->string('event');
        $table->string('entity_type')->nullable();   // e.g. Intern, Project
        $table->string('entity_id')->nullable();     // model ID
        $table->json('metadata')->nullable();        // optional extra details
        $table->string('ip')->nullable();
        $table->string('user_agent')->nullable();
        $table->timestamps();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
