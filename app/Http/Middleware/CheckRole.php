<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @param  string|null  $roles  Pipe-separated roles, e.g., "admin|super_admin"
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ?string $roles = null)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized');
        }

        // If no roles provided, allow all authenticated users
        if ($roles) {
            $allowedRoles = explode('|', $roles);
            if (!in_array($user->role, $allowedRoles)) {
                abort(403, 'Unauthorized');
            }
        }

        return $next($request);
    }
}
