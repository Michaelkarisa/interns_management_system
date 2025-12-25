<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InternsController;
use App\Http\Controllers\Api\InternsProfileController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/company',[SettingsController::class,'company']);
Route::middleware('auth:sanctum')->group(function () {
  
    // Current user
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile/verify-password',[AuthController::class, 'verifyPassword']);
    Route::delete('/profile',[AuthController::class.'destroy']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Force password change check
    Route::get('/check-password-force', [AuthController::class, 'checkPasswordForce']);
    Route::post('/password/force-update',[AuthController::class, 'forceUpdatePassword']);
    Route::post('/force-update-password', [AuthController::class, 'forceUpdatePassword']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);

    // -----------------------------
    // Admin & Super Admin
    // -----------------------------
    Route::middleware(['verified', 'checkrole:super_admin|admin', 'force_password_change'])->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Interns
        Route::get('/interns', [InternsController::class, 'index']);
        Route::post('/interns', [InternsProfileController::class, 'store']);
        Route::get('/interns/filter', [InternsController::class, 'filter']);
        Route::get('/interns/report', [InternsController::class, 'generateReport']);
        Route::get('/interns/{id}', [InternsProfileController::class, 'index']);
        Route::put('/interns/{id}', [InternsProfileController::class, 'update']);
        Route::get('/interns/{intern}/report', [InternsProfileController::class, 'generateProfileReport']);

        // Projects
        Route::get('/projects', [ActivityController::class, 'index']);
        Route::post('/projects', [ActivityController::class, 'store']);
        Route::put('/projects/{id}', [ActivityController::class, 'update']);
        Route::delete('/projects/{id}', [ActivityController::class, 'destroy']);
        Route::get('/projects/filter', [ActivityController::class, 'filter']);
        Route::get('/projects/report', [ActivityController::class, 'generateReport']);

        // Settings
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::get('/company', [SettingsController::class, 'company']);
        
    });

    // -----------------------------
    // Super Admin only
    // -----------------------------
    Route::middleware(['checkrole:super_admin', 'force_password_change'])->group(function () {

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/filter', [UserController::class, 'filter']);
        Route::get('/users/report', [UserController::class, 'generateReport']);
        Route::post('/users/{id}/promote', [UserController::class, 'promoteToAdmin']);
        Route::post('/users/{id}/demote', [UserController::class, 'demoteToUser']);

        // Audit logs
        Route::get('/auditlogs', [AuditController::class, 'index']);
        Route::get('/auditlogs/filter', [AuditController::class, 'filter']);
        Route::get('/auditlogs/report', [AuditController::class, 'generateReport']);

        // Company update
        Route::put('/settings/company', [SettingsController::class, 'update']);
    });
});
