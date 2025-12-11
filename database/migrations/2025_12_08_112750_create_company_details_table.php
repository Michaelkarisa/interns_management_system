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
        Schema::create('company_details', function (Blueprint $table) {
            $table->string('id')->primary(); // Primary key
            $table->string('name'); // Company name
            $table->string('email')->nullable(); // Optional email
            $table->string('phone')->nullable(); // Optional phone number
            $table->string('website')->nullable(); // Optional website
            $table->text('address')->nullable(); // Optional address
            $table->string('logo_path')->nullable(); // Path to logo image
            $table->string('tax_id')->nullable(); // Optional tax identification number
            $table->string('industry')->nullable(); // Optional industry type
            $table->string('system_name')->nullable();
            $table->timestamps(); // created_at & updated_at
            $table->softDeletes(); // deleted_at for soft deletes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_details');
    }
};
