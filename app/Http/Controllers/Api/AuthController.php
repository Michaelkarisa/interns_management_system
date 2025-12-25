<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Register: create new user and issue token
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => $request->role_id ?? 3, // Default role (adjust as needed)
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('New user registered', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $user->load('role'),
            'token'   => $token,
        ], 201);
    }

    /**
     * Login: issue token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {

            Log::warning('Login failed', [
                'email' => $request->email,
                'ip'    => $request->ip(),
            ]);

            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if force password change is required
        if ($user->must_change_password) {
            Log::info('User requires password change', [
                'user_id' => $user->id,
                'email'   => $user->email,
            ]);

            return response()->json([
                'message' => 'Password change required',
                'must_change_password' => true,
                'user' => $user->only(['id', 'name', 'email']),
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('User logged in', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'user'  => $user->load('role'),
            'token' => $token,
        ]);
    }

    /**
     * Logout: revoke current token
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        Log::info('User logged out', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('role')
        ]);
    }

    /**
     * Forgot Password: Send reset link
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            Log::warning('Password reset requested for non-existent email', [
                'email' => $request->email,
                'ip'    => $request->ip(),
            ]);

            // Return success anyway to prevent email enumeration
            return response()->json([
                'message' => 'If that email exists, we have sent a password reset link.',
            ]);
        }

        // Send password reset link
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('Password reset link sent', [
                'email' => $request->email,
                'ip'    => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        Log::error('Failed to send password reset link', [
            'email' => $request->email,
            'status' => $status,
            'ip'    => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Unable to send reset link. Please try again.',
        ], 500);
    }

    /**
     * Reset Password: Update password using token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));

                Log::info('Password reset successful', [
                    'user_id' => $user->id,
                    'email'   => $user->email,
                ]);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            // Get the user and generate token for automatic login
            $user = User::where('email', $request->email)->first();
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Password has been reset successfully.',
                'user'    => $user->load('role'),
                'token'   => $token,
            ]);
        }

        Log::warning('Password reset failed', [
            'email'  => $request->email,
            'status' => $status,
        ]);

        return response()->json([
            'message' => __($status)
        ], 422);
    }

    /**
     * Force password update
     */
    public function forceUpdatePassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();

        $user->password = Hash::make($request->password);
        $user->must_change_password = false;
        $user->save();

        $token = $user->createToken('api-token')->plainTextToken;

        Log::notice('User forced password update', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
            'user'    => $user->load('role'),
            'token'   => $token,
        ]);
    }

    /**
     * Regular password update
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {

            Log::warning('Password update failed (wrong current password)', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'ip'      => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        Log::info('User updated password', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
            'user'    => $user,
        ]);
    }

    /**
     * Verify password (used before sensitive actions)
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();
        $isValid = Hash::check($request->password, $user->password);

        Log::info('Password verification attempt', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
            'status'  => $isValid ? 'success' : 'failed',
        ]);

        return response()->json([
            'valid' => $isValid,
        ]);
    }

    /**
     * Delete account (soft delete)
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $user->currentAccessToken()->delete();
        $user->delete();

        Log::alert('User account deleted', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User deleted',
        ]);
    }
}