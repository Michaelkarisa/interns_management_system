<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ForcedPasswordController extends Controller
{
    /**
     * Show the forced password change page.
     */
    public function show()
    {
        $user = Auth::user();

        // Prevent access if user does not need to change password
        if (!$user || !$user->must_change_password) {
            Log::info('User tried to access forced password page but does not need to change password', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return redirect()->route('dashboard');
        }

        Log::info('User accessed forced password change page', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return Inertia::render('Auth/ForceChangePassword', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Update the password.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Prevent update if user does not need to change password
        if (!$user || !$user->must_change_password) {
            Log::warning('User attempted to update password but does not require a forced change', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return redirect()->route('dashboard');
        }

        // Validate new password
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Update user password and mark as changed
        $user->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        Log::info('User successfully updated forced password', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Optional: regenerate session for security
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', 'Password updated successfully.');
    }
}
