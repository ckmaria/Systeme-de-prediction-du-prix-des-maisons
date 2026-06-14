<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    protected $fillable = [
        'surface',
        'chambres',
        'localisation',
        'type_bien',
        'etat',
        'facades',
        'etage',
        'ascenseur',
        'prix_estime',
        'payload',
    ];

    protected $casts = [
        'surface' => 'float',
        'chambres' => 'integer',
        'facades' => 'integer',
        'etage' => 'integer',
        'ascenseur' => 'boolean',
        'prix_estime' => 'integer',
        'payload' => 'array',
    ];
}
