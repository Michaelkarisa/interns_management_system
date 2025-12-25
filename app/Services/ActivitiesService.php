<?php

namespace App\Services;

use App\Models\Intern;
use App\Models\Activity;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
class ActivitiesService
{

    public function count(){

        return Activity::count();
    }



public function getActivities(array $filters = [], int $perPage = null, int $page = null)
{
    $query = Activity::query()
        ->with(['intern', 'team']);

    // Filter by intern ID (resolved from name in controller)
    if (!empty($filters['intern_id'])) {
        $query->where('intern_id', $filters['intern_id']);
    }

    // Filter by team member (if needed)
    if (!empty($filters['team_member_id'])) {
        $query->whereHas('team', function ($q) use ($filters) {
            $q->where('interns.id', $filters['team_member_id']);
        });
    }

    // Title filter
    if (!empty($filters['title'])) {
        $query->where('title', 'like', '%' . $filters['title'] . '%');
    }

    // Impact filter
    if (!empty($filters['impact'])) {
        $query->where('impact', 'like', '%' . $filters['impact'] . '%');
    }

    // Generic search
    if (!empty($filters['search'])) {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('impact', 'like', "%{$search}%");
        });
    }

    // Date range filters
    if (!empty($filters['date_from'])) {
        $query->whereDate('created_at', '>=', $filters['date_from']);
    }
    if (!empty($filters['date_to'])) {
        $query->whereDate('created_at', '<=', $filters['date_to']);
    }

    // Order & paginate
    $query->orderBy('created_at', 'desc');

    if ($perPage) {
        $page = $page ?: LengthAwarePaginator::resolveCurrentPage();
        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    return $query->get();
}

     public function createOrUpdateActivity(array $data): Activity
    {
        // Check if activity with same title already exists for this owner
        $activity = Activity::firstOrCreate(
            [
                'title'     => $data['title'],
                'intern_id' => $data['intern_id'],
            ],
            [
                'description' => $data['description'] ?? null,
                'impact'      => $data['impact'] ?? null,
                'url'         => $data['url'] ?? null,
            ]
        );

        // Attach team members if provided
        if (!empty($data['team_members'])) {
            foreach ($data['team_members'] as $internId) {
                // Attach or restore soft-deleted pivot
                $activity->team()->syncWithoutDetaching([$internId]);
            }
        }

        // Reload activity with team
        $activity->load('team');

        return $activity;
    }

    /**
     * Update an existing activity by ID
     */


    /**
     * Soft delete an activity by ID
     */
    public function delete(array $attributes): array
    {
        $activityId = $attributes['activity_id'] ?? null;
        $internId   = $attributes['intern_id'] ?? null;

        if (!$activityId || !$internId) {
            throw new \InvalidArgumentException('activity_id and intern_id are required.');
        }

        $activity = Activity::findOrFail($activityId);

        if ($activity->intern_id === $internId) {
            // Owner: soft delete the activity
            $activity->delete();
            $message = 'Activity deleted successfully.';
        } else {
            // Collaborator: remove from team (soft delete pivot if using SoftDeletes)
            $activity->team()->updateExistingPivot($internId, ['deleted_at' => now()]);
            $message = 'You have been removed from this activity.';
        }

        return [
            'message'     => $message,
            'activity_id' => $activityId,
        ];
    }

    public function reportQuery(Request $request){
 $query = Activity::with('intern', 'team'); // adjust based on your relations

    // -----------------------------
    // SEARCH FILTER
    // -----------------------------
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    if ($request->filled('intern_name')) {
        $internName = $request->intern_name;
        $query->where(function ($q) use ($internName) {
            $q->whereHas('intern', fn($q2) => $q2->where('name', 'like', "%{$internName}%"))
              ->orWhereHas('team', fn($q2) => $q2->where('name', 'like', "%{$internName}%"));
        });
    }

    if ($request->filled('date_from')) {
        $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->filled('date_to')) {
        $query->whereDate('created_at', '<=', $request->date_to);
    }

    // -----------------------------
    // SORT
    // -----------------------------
    $direction = in_array($request->sort_direction, ['asc','desc']) ? $request->sort_direction : 'desc';
    if ($request->filled('sort_by')) {
        $query->orderBy($request->sort_by, $direction);
    } else {
        $query->orderBy('created_at', 'desc');
    }

    // -----------------------------
    // FETCH DATA
    // -----------------------------
    
        return $query->get();
    }
}