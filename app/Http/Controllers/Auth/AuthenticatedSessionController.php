<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $audit;

    public function __construct(AuditLogService $auditService)
    {
        $this->audit = $auditService;
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();

    $user = Auth::user();

    // -----------------------------
    // 1. Forced Password Change Check
    // -----------------------------
    if ($user->must_change_password) {
        // Regenerate session after authentication
        $request->session()->regenerate();

        // Optional: Log user login even if forcing password change
        if ($this->audit) {
            $this->audit->log(
                'user_logged_in',
                'User',
                $user->id,
                [
                    'email' => $user->email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'forced_password_change' => true,
                ]
            );
        }

        // Add flash message
        return redirect()->route('password.force')
                         ->with('success', 'Login successful! You must change your password first.');
    }

    // -----------------------------
    // 2. Normal Login
    // -----------------------------
    $request->session()->regenerate();

    // Log user login normally
    if ($this->audit) {
        $this->audit->log(
            'user_logged_in',
            'User',
            $user->id,
            [
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'forced_password_change' => false,
            ]
        );
    }

    // Add flash message for normal login
    return redirect()->intended(route('dashboard', absolute: false))
                     ->with('success', 'Login successful!');
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
