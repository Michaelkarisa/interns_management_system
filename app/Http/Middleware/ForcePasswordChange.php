<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * For API requests, returns a JSON response if the user must change their password.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Detect if request expects JSON (API request)
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Password change required',
                    'force_password_change' => true,
                ], 403);
            }

            // Web route fallback (optional)
            if (!$request->routeIs('password.force') &&
                !$request->routeIs('password.force.update')) {
                return redirect()->route('password.force');
            }
        }

        return $next($request);
    }
}
