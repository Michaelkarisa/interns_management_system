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
        Schema::create('activity_team', function (Blueprint $table) {
            $table->string('activity_id');
            $table->string('intern_id'); // team member ID
            $table->timestamps();
            $table->softDeletes();  // adds deleted_at timestamp
            $table->primary(['activity_id', 'intern_id']); // composite primary key
            $table->foreign('activity_id')->references('id')->on('activities')->onDelete('cascade');
            $table->foreign('intern_id')->references('id')->on('interns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_team');
    }
};
