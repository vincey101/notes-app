<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotesController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Notes routes
    Route::get('/get-notes', [NotesController::class, 'index']);
    Route::post('/create-note', [NotesController::class, 'store']);
    Route::get('/get-note/{note}', [NotesController::class, 'show']);
    Route::put('/update-note/{note}', [NotesController::class, 'update']);
    Route::delete('/delete-note/{note}', [NotesController::class, 'destroy']);
}); 