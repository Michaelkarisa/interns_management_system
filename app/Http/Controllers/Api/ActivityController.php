<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Intern;
use App\Services\ActivitiesService;
use App\Services\SecurityService;
use App\Services\AuditLogService;
use App\Models\Activity;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\DestroyActivityRequest;

// In ProjectController.php
use Barryvdh\DomPDF\Facade\Pdf;
class ActivityController extends Controller
{
    protected $activity;
    protected $security;
    protected $audit;

    public function __construct(
        ActivitiesService $activityService,
        SecurityService $securityService,
        AuditLogService $auditService
    ) {
        $this->activity = $activityService;
        $this->security = $securityService;
        $this->audit    = $auditService;
    }

    public function index()
    {
        $data = $this->activity->getActivities([], 15, 0);

        // Log view event
        $this->audit->log(
            'project_list_viewed',
            'Activity',
            null,
            ['count' => count($data)]
        );

        return Inertia::render("AllProjects", [
            "data"       => $data,
            'activePath' => 'projects',

        ]);
    }

    public function filter(Request $request)
    {
        $filters = [];

        if ($request->has('search'))      $filters['search'] = $request->input('search');
        if ($request->has('intern_name')) $filters['intern_name'] = $request->input('intern_name');
        if ($request->has('date_from'))   $filters['date_from'] = $request->input('date_from');
        if ($request->has('date_to'))     $filters['date_to']   = $request->input('date_to');

        $page    = $request->input('page', 1);
        $perPage = 15;

        $sanitized = $this->security->sanitizeFilters($filters);
        $data      = $this->activity->getActivities($sanitized, $perPage, $page);

        // Log filter event
        $this->audit->log(
            'project_filter_applied',
            'Activity',
            null,
            ['filters' => $sanitized]
        );

        return response()->json($data);
    }

    public function store(StoreActivityRequest $request)
    {
        $data = $request->validated();

        $activity = $this->activity->createOrUpdateActivity($data);

        // Log creation
        $this->audit->log(
            'project_created',
            'Activity',
            $activity->id,
            ['title' => $activity->title]
        );

        return response()->json([
            'message'  => 'Activity saved successfully.',
            'activity' => $activity,
        ]);
    }

    public function update(StoreActivityRequest $request)
    {
        $data = $request->validated();

        $activity = $this->activity->createOrUpdateActivity($data);

        // Log update
        $this->audit->log(
            'project_updated',
            'Activity',
            $activity->id,
            ['title' => $activity->title]
        );

        return response()->json([
            'message'  => 'Activity updated successfully.',
            'activity' => $activity,
        ]);
    }

    public function destroy(DestroyActivityRequest $request)
    {
        $data = $request->validated();

        $result = $this->activity->delete($data);

        // Log deletion or team removal
        $this->audit->log(
            $result['action'],          // "project_deleted" OR "team_member_removed"
            'Activity',
            $data['activity_id'],
            $result                     // contains owner=true/false
        );

        return response()->json([
            'message' => 'Action completed.',
            'result'  => $result
        ]);
    }



public function generateReport(Request $request)
{
   
$projects = $this->activity->reportQuery($request);
    // -----------------------------
    // AUDIT LOG
    // -----------------------------
    if ($this->audit) {
        $this->audit->log(
            'projects_report_generated', // event
            'Activity',                  // module/entity
            null,                        // target (not specific)
            [
                'filters'       => $request->all(),
                'total_records' => $projects->count(),
                'generated_by'  => Auth::id(),
            ]
        );
    }

    // -----------------------------
    // GENERATE PDF
    // -----------------------------
    $pdf = Pdf::loadView('reports.projects', compact('projects'))
               ->setPaper('a4', 'landscape');

    return $pdf->download('projects-report-' . now()->format('Y-m-d') . '.pdf');
}

}
