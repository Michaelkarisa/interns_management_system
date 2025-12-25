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
 Schema::create('interns', function (Blueprint $table) {
    $table->string('id')->primary(); // recommended
    $table->string('name');
    $table->string('phone')->nullable();
    $table->string('email')->unique();
    $table->string('passport_photo')->nullable();
    $table->string('institution')->nullable();
    $table->string('position')->nullable();
    $table->string('cv')->nullable();
    $table->string('course')->nullable();
    $table->string('department')->nullable();
    $table->date('from')->nullable();
    $table->date('to')->nullable();
    $table->boolean('graduated')->default(false);
    $table->boolean('recommended')->default(false);
    $table->integer('performance')->nullable(); // FIXED
    $table->json('skills')->nullable();
    $table->string('notes')->nullable();
    $table->softDeletes();  // adds deleted_at timestamp
    $table->timestamps();
});

    }

 /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interns');
    }
};