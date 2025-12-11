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
Schema::create('activities', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('intern_id');        // The main intern who did the activity
    $table->string('title')->nullable();
    $table->text('description')->nullable();
    $table->string('impact')->nullable();
    $table->string('url')->nullable();
    $table->softDeletes();  // adds deleted_at timestamp
    $table->timestamps();
    $table->foreign('intern_id')->references('id')->on('interns')->onDelete('cascade');
});


    }

 /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};