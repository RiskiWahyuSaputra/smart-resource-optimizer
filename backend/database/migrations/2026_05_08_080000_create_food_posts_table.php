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
        Schema::create('food_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('quantity');
            $table->string('quantity_unit')->default('porsi');
            $table->text('pickup_address');
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('long', 11, 8)->nullable();
            $table->timestamp('available_until');
            $table->string('image_url')->nullable();
            $table->enum('status', ['available', 'claimed', 'completed', 'expired'])->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_posts');
    }
};
