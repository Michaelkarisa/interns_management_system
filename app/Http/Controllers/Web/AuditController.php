<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CompanyDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\SecurityService;
use App\Services\AuditLogService;
use App\Models\Activity;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;
// app/Http/Controllers/AuditLogController.php
use Barryvdh\DomPDF\Facade\Pdf;
class AuditController extends Controller
{


    protected $security;
    protected $audit;

    public function __construct(
        SecurityService $securityService,
        AuditLogService $auditService
    ) {
        $this->security = $securityService;
        $this->audit    = $auditService;
    }

    public function index(){
     $data = $this->audit->getLogs([], 15, 0);


        return Inertia::render("AuditLogs", [
             "data"       => $data,
            'activePath' => 'auditlogs',
        ]);
    }

    public function filter(Request $request){
        $rawFilters = [
    'search'    => $request->input('search'),
    'date_from' => $request->input('date_from'),            // e.g., "2025-12-01"
    'date_to'   => $request->input('date_to'),              // e.g., "2025-12-04"
    'page'      => $request->input('page', 1),             // default to 1
    'sort_by'   => $request->input('sort_by', 'created_at'), // default to "created_at"
    'event'     => $request->input('event'),               // e.g., "login"
];


        $filters = $this->security->sanitizeFilters($rawFilters);

        $page    = $request->input('page', 1);
        $perPage = $request->input('per_page', 15);

        $logs = $this->audit->getLogs($filters, $perPage, $page);
     return response()->json($logs);
    }



public function generateReport(Request $request)
{
    $logs = $this->audit->reportQuery($request);

    // -----------------------------
    // AUDIT LOG
    // -----------------------------
    if ($this->audit) {
        $this->audit->log(
            'audit_logs_report_generated', // event
            'AuditLog',                     // module/entity
            null,                           // target (not specific)
            [
                'filters'       => $request->all(),
                'total_records' => $logs->count(),
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
    $pdf = Pdf::loadView('reports.audit-logs', [
        'logs'=>$logs,
        'appName'=>$appName,
        'appicon'=> $appicon
    ])
               ->setPaper('a4', 'landscape')
               ->setOption('enable-local-file-access', true);

    return $pdf->download('logs-report-' . now()->format('Y-m-d') . '.pdf');
}

}