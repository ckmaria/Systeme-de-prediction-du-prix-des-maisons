<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table): void {
            $table->id();
            $table->decimal('surface', 10, 2);
            $table->unsignedSmallInteger('chambres');
            $table->string('localisation', 100);
            $table->string('type_bien', 50);
            $table->string('etat', 50);
            $table->unsignedTinyInteger('facades');
            $table->unsignedTinyInteger('etage')->default(0);
            $table->boolean('ascenseur')->default(false);
            $table->unsignedInteger('prix_estime');
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
