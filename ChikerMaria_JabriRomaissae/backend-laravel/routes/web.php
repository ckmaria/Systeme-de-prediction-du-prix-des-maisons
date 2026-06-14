<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'message' => 'API Laravel - Prediction du prix des maisons',
    'endpoint' => '/api/predict',
]));
