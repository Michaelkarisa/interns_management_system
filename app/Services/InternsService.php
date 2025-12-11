<?php

namespace App\Services;

use App\Models\Intern;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
class InternsService
{


public function getInterns(array $filters = [], int $perPage = null, int $page = null)
{
    $query = Intern::query();

    // Status filters
    if (!empty($filters['active'])) {
        $query->where(function ($q) {
            $q->whereNull('to')
              ->orWhere('to', '');
        });
    }

    if (!empty($filters['completed'])) {
        $query->whereNotNull('to')
              ->where('to', '!=', '');
    }

    if (!empty($filters['recommended'])) {
        $query->where('recommended', true);
    }

    if (!empty($filters['graduated'])) {
        $query->where('graduated', true);
    }

    // Minimum performance
    if (!empty($filters['min_performance'])) {
        $query->where('performance', '>=', $filters['min_performance']);
    }

    // Skills filter (JSON column)
    if (!empty($filters['skills']) && is_array($filters['skills'])) {
        foreach ($filters['skills'] as $skill) {
            $query->whereJsonContains('skills', $skill);
        }
    }

    // Search across multiple columns
    if (!empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('institution', 'like', "%{$search}%")
              ->orWhere('position', 'like', "%{$search}%")
              ->orWhere('course', 'like', "%{$search}%")
              ->orWhere('department', 'like', "%{$search}%");
        });
    }
    if (!empty($filters['email'])) {
    $query->where('email', 'like', "%{$filters['email']}%");
}

    // Date filters (assuming filtering by created_at)
    if (!empty($filters['date_a'])) {
        $query->whereDate('created_at', '>=', $filters['date_a']);
    }
    if (!empty($filters['date_b'])) {
        $query->whereDate('created_at', '<=', $filters['date_b']);
    }

    // Name ordering
    $query->orderBy('name', 'asc');

    // Pagination
    if ($perPage) {
        $page = $page ?: LengthAwarePaginator::resolveCurrentPage();
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    return $query->get();
}

    public function count(){
        return Intern::query()->count();
    }

public function activeInterns()
{
    return Intern::where(function ($q) {
        $q->whereNull('to')
          ->orWhere('to', '');
    })->count();
}

public function completedInterns()
{
    return Intern::whereNotNull('to')
                 ->where('to', '!=', '')
                 ->count();
}


public function recommendedInterns()
{
    return Intern::where('recommended', true)->count();
}


public function getTopPerformingInterns($minScore = 80)
{
    return Intern::where('performance', '>', $minScore)->get();
}

public function getIntern(string $id)
{
    return Intern::with([
        'activities',
        'activities.team'
    ])->findOrFail($id);
}

  public function create(array $attributes)
    {
        return Intern::create($attributes);
    }

    /**
     * Update an existing intern by ID
     */
   public function update(string $id, array $attributes)
{
    $intern = Intern::findOrFail($id);

    // Filter out null values so only non-null fields are updated
    $filteredAttributes = array_filter($attributes, fn($value) => !is_null($value));

    $intern->update($filteredAttributes);

    return $intern->fresh(); // return updated intern
}


    /**
     * Soft delete an intern by ID
     */
    public function delete(string $id)
    {
        $intern = Intern::findOrFail($id);
        return $intern->delete(); // soft delete
    }


    public function  reportQuery(Request $request){
       $query = Intern::query();

    // -----------------------------
    // SEARCH (proper OR grouping)
    // -----------------------------
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('institution', 'like', "%{$search}%");
        });
    }

    // -----------------------------
    // Individual filters
    // -----------------------------
    if ($request->filled('name')) {
        $query->where('name', 'like', "%{$request->name}%");
    }

    if ($request->filled('email')) {
        $query->where('email', 'like', "%{$request->email}%");
    }

    if ($request->filled('institution')) {
        $query->where('institution', 'like', "%{$request->institution}%");
    }

    if ($request->filled('position')) {
        $query->where('position', 'like', "%{$request->position}%");
    }

    if ($request->filled('min_performance')) {
        $query->where('performance', '>=', $request->min_performance);
    }

    // -----------------------------
    // Status filters
    // -----------------------------
    if ($request->boolean('active')) {
        $query->whereNull('to');
    }

    if ($request->boolean('completed')) {
        $query->whereNotNull('to');
    }

    if ($request->boolean('recommended')) {
        $query->where('recommended', true);
    }

    if ($request->boolean('graduated')) {
        $query->where('graduated', true);
    }

        return $query->get();
    }
}
