<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * Redirects users to the password change page if they must change their password.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Only check authenticated users
        if ($user && $user->must_change_password) {
            // Allow accessing the password change routes themselves
            if (!$request->routeIs('password.force') &&
                !$request->routeIs('password.force.update')) {
                return redirect()->route('password.force');
            }
        }

        return $next($request);
    }
}
