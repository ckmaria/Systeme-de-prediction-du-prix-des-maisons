<?php

use App\Http\Controllers\PredictionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::post('/predict', [PredictionController::class, 'predict']);
Route::get('/predictions', [PredictionController::class, 'index']);
