<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UserService
{
    /**
     * Promote a user to admin
     *
     * @param string $id
     * @return User
     * @throws ModelNotFoundException
     */
    public function promoteToAdmin(string $id): User
    {
        $user = User::findOrFail($id);

        $user->role = 'admin';
        $user->save();

        return $user;
    }

    /**
     * Optional: Demote admin back to user
     */
    public function demoteToUser(string $id): User
    {
        $user = User::findOrFail($id);

        $user->role = 'user';
        $user->save();

        return $user;
    }

    public function getUsers(array $filters = [], int $perPage = null, int $page = null)
{
    $query = User::query();   // Always ignore deleted users

    // Filter: search by name or email
    if (!empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Filter: role(s)
    if (!empty($filters['role'])) {
        // single role (string) — admin / super_admin
        if (is_string($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // array of roles → e.g. ['admin', 'super_admin']
        if (is_array($filters['role'])) {
            $query->whereIn('role', $filters['role']);
        }
    }

    // Filter: active or deactivated sessions
    if (!empty($filters['active'])) {
        // Active users = have authenticated recently (you define threshold)
        $query->whereNotNull('last_login_at');
    }

    // Filter: logged out
    if (!empty($filters['logged_out'])) {
        $query->whereNull('last_login_at');
    }

    // Sort by name ASC
    $query->orderBy('name', 'asc');

    // Pagination support
    if ($perPage) {
        $page = $page ?: LengthAwarePaginator::resolveCurrentPage();
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    return $query->get();
}

  public function delete(string $id)
    {
        $user = User::findOrFail($id);
        return $user->delete(); // soft delete
    }

    public function create(array $attributes){
       return User::create([
        'name'     => $attributes['name'],
        'email'    => $attributes['email'],
        'password' => Hash::make($attributes['password']),
    ]);
    }

      public function  reportQuery(Request $request){
   $query = User::query();

    // Apply same filters as /users/filter
    if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', "%{$request->search}%")
              ->orWhere('email', 'like', "%{$request->search}%");
        });
    }

    if ($request->filled('role')) {
        $query->where('role', $request->role);
    }

    if ($request->filled('status')) {
        // optional depending on your data model
    }

    if ($request->filled('sort_by')) {
        $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
        $query->orderBy($request->sort_by, $direction);
    }

      return $query->get();
      
      }
}
