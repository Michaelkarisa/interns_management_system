<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

    return response()->json([
        'data'       => $data, 
        'activePath' => 'projects',
    ], 200);
}


  public function filter(Request $request)
{
    $filters = [];

    // Generic search
    if ($request->filled('search')) {
        $filters['search'] = $request->input('search');
    }

    // 🔑 Convert intern_name → intern_id
    if ($request->filled('intern_name')) {
        $intern = Intern::where('name', 'like', '%' . $request->input('intern_name') . '%')
            ->first();
        if ($intern) {
            $filters['intern_id'] = $intern->id;
        }
        // If no intern found, the query will return empty (no extra handling needed)
    }

    // Date filters
    if ($request->filled('date_from')) {
        $filters['date_from'] = $request->input('date_from');
    }
    if ($request->filled('date_to')) {
        $filters['date_to'] = $request->input('date_to');
    }

    $page = $request->input('page', 1);
    $perPage = 15;

    $sanitized = $this->security->sanitizeFilters($filters);
    $data = $this->activity->getActivities($sanitized, $perPage, $page);

    // Log audit
    $this->audit->log(
        'activity_filter_applied', // fixed typo
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
    $company = CompanyDetails::first();
    $appName = $company ? $company->system_name :'';
    $appicon = null;
        if ($company && $company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            // Absolute path required for DOMPDF
            $appicon = Storage::disk('public')->path($company->logo_path);
        }
    $pdf = Pdf::loadView('reports.projects', compact('projects', 'appName', 'appicon'))
               ->setPaper('a4', 'landscape')
               ->setOption('enable-local-file-access', true);

    return $pdf->download('projects-report-' . now()->format('Y-m-d') . '.pdf');
}

}
