<?php
namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
class AuditLogService
{
    public function log($event, $entityType, $entityId, array $metadata = [])
    {
        return AuditLog::create([
            'user_id'     => Auth::id(),
            'event'       => $event,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'metadata'    => $metadata,       // stored as JSON
            'ip'          => request()->ip(),
            'user_agent'  => request()->userAgent(),
        ]);
    }

      public function getLogs(array $filters = [], int $perPage = null, int $page = null)
    {
        $query = AuditLog::query()->with('user'); // eager load user

        // Filter by user
        if (!empty($filters['user'])) {
            $search = $filters['user'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by event
        if (!empty($filters['event'])) {
            $query->where('event', 'like', "%{$filters['event']}%");
        }

        // Filter by entity_type
        if (!empty($filters['entity_type'])) {
            $query->where('entity_type', $filters['entity_type']);
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Sorting: default by date descending
        $sortField = $filters['sort_field'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        // Pagination
        if ($perPage) {
            $page = $page ?: LengthAwarePaginator::resolveCurrentPage();
            return $query->paginate($perPage, ['*'], 'page', $page);
        }

        return $query->get();
    }

     public function reportQuery(Request $request){
         $query = AuditLog::with('user');

    // --- SEARCH FILTER FIXED ---
    if ($request->filled('search')) {
        $search = $request->search;

        $query->where(function ($q) use ($search) {
            $q->whereHas('user', fn($u) => 
                    $u->where('name', 'like', "%{$search}%")
              )
              ->orWhere('event', 'like', "%{$search}%");
        });
    }

    if ($request->filled('event')) {
        $query->where('event', 'like', "%{$request->event}%");
    }

    if ($request->filled('date_from')) {
        $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->filled('date_to')) {
        $query->whereDate('created_at', '<=', $request->date_to);
    }

    // --- SORT FIX ---
    $direction = $request->sort_direction === 'asc' ? 'asc' : 'desc';

    if ($request->filled('sort_by')) {
        $query->orderBy($request->sort_by, $direction);
    } else {
        $query->orderBy('created_at', 'desc');
    }
        
         return $query->get();
     }
}
