<?php

use App\Http\Controllers\Web\UserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Config;
use App\Http\Controllers\Web\ActivityController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\InternsController;
use App\Http\Controllers\Web\SettingsController;
use App\Http\Controllers\Web\InternsProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\AuditController;
use App\Http\Controllers\ForcedPasswordController;
use Illuminate\Foundation\Application;

use Inertia\Inertia;
Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// -----------------------------
// Protected routes for super_admin|admin
// -----------------------------
Route::middleware(['auth', 'verified', 'checkrole:super_admin|admin', 'force_password_change'])->group(function() {
    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');
    Route::get('/interns',[InternsController::class,'index'])->name('interns');
    Route::get('/projects',[ActivityController::class, 'index'])->name('projects');
    Route::get('/settings',[SettingsController::class, 'index'])->name('settings');
    Route::post('/interns/addintern',[InternsProfileController::class, 'store'])->name('addIntern');
    Route::get('/interns/profile/{id}',[InternsProfileController::class,'index'])->name('internProfile');
    Route::post('/interns/update/{id}',[InternsProfileController::class,'update'])->name('updateIntern');
    Route::get('/interns/filter', [InternsController::class,'filter'])->name('filterInterns');
    Route::get('/projects/filter', [ActivityController::class,'filter'])->name('filterProjects');
    Route::post('/projects/add', [ActivityController::class,'store'])->name('addProject');
    Route::post('/projects/update/{id}', [ActivityController::class,'update'])->name('updateProject');
    Route::delete('/projects', [ActivityController::class, 'destroy'])->name('deleteProject');
       // routes/web.php
    Route::get('/interns/report', [InternsController::class, 'generateReport']);
        // routes/web.php
    Route::get('/projects/report', [ActivityController::class, 'generateReport']);
      // routes/web.php
    Route::get('/interns/{intern}/report', [InternsProfileController::class, 'generateProfileReport']);
    Route::get('/company', [SettingsController::class,'comapny']);
});

// -----------------------------
// Protected routes for super_admin only
// -----------------------------
Route::middleware(['auth','checkrole:super_admin', 'force_password_change'])->group(function() {
    Route::post('/users/{id}/promote', [UserController::class, 'promoteToAdmin'])->name('users.promote');
    Route::post('/users/{id}/demote', [UserController::class, 'demoteToUser'])->name('users.demote');
    Route::get('/users', [UserController::class,'index'])->name('users');
    Route::get('/users/filter',[UserController::class,'filter'])->name('filterUsers');
    Route::get('/auditlogs',[AuditController::class,'index'])->name('auditlogs');
    Route::get('/auditlogs/filter',[AuditController::class,'filter'])->name('filterLogs');
    Route::post('/users/register',[UserController::class,'store']);
    // routes/web.php (or api.php if using API auth)
    Route::get('/users/report', [UserController::class, 'generateReport'])->name('users.report');
       // routes/web.php
    Route::get('/auditlogs/report', [AuditController::class, 'generateReport'])->name('auditlogs.report');
    Route::post('/settings/company', [SettingsController::class, 'update']);
});

// -----------------------------
// Routes for forcing password change
// -----------------------------
Route::middleware(['auth'])->group(function () {
    Route::get('/force-password', [ForcedPasswordController::class, 'show'])
        ->name('password.force');
    Route::post('/force-password', [ForcedPasswordController::class, 'update'])
        ->name('password.force.update');
});

// -----------------------------
// User profile routes
// -----------------------------
Route::middleware(['auth', 'force_password_change'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::get('/debug', function () {
    return [
        'session.driver' => Config::get('session.driver'),
        'session.domain' => Config::get('session.domain'),
        'sanctum.stateful' => Config::get('sanctum.stateful'),
        'app.url' => Config::get('app.url'),
    ];
});

require __DIR__.'/auth.php';