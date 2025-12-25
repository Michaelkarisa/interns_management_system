<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Intern;
use App\Services\InternsService;
use App\Services\SecurityService;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// app/Http/Controllers/InternController.php
use Barryvdh\DomPDF\Facade\Pdf;
class InternsController extends Controller
{
    protected $interns;
    protected $security;
    protected $audit;

    public function __construct(
        InternsService $internsService,
        SecurityService $securityService,
        AuditLogService $auditService // optional structured logs
    ) {
        $this->interns  = $internsService;
        $this->security = $securityService;
        $this->audit    = $auditService;
    }

 public function index()
{
    $data = $this->interns->getInterns([], 15, 0);

    // Log the event
    Log::info('Intern list viewed', [
        'user_id' => Auth::id(),
        'count'   => count($data),
        'route'   => 'interns.index',
    ]);

    // Optional structured audit
    if ($this->audit) {
        $this->audit->log(
            'intern_list_viewed',
            'Intern',
            null,
            ['count' => count($data)]
        );
    }

    return response()->json([
        'data'       => $data,
        'activePath' => 'interns',
    ], 200);
}


    public function filter(Request $request)
    {
        try {
            // Extract filters from request
         $data = [
    'search'          => $request->input('search', ''),
    'name'            => $request->input('name', ''),
    'email'           => $request->input('email', ''),
    'institution'     => $request->input('institution', ''),
    'position'        => $request->input('position', ''),
    'min_performance' => $request->input('min_performance', ''),
    'active'          => $request->boolean('active', false),
    'completed'       => $request->boolean('completed', false),
    'recommended'     => $request->boolean('recommended', false),
    'graduated'       => $request->boolean('graduated', false),
    'skills'          => $request->input('skills', []),
    'date_a'          => $request->input('date_a'), // null if not provided
    'date_b'          => $request->input('date_b'), // null if not provided
];


            $page    = $request->input('page', 1);
            $perPage = $request->input('per_page', 15);

            $filters = $this->security->sanitizeFilters($data);

            $interns = $this->interns->getInterns($filters, $perPage, $page);

            // Log filter event
            Log::info('Intern filter applied', [
                'user_id' => Auth::id(),
                'filters' => $filters,
                'count'   => count($interns),
                'route'   => 'interns.filter',
            ]);

            if ($this->audit) {
                $this->audit->log(
                    'intern_filter_applied',
                    'Intern',
                    null,
                    ['filters' => $filters, 'count' => count($interns)]
                );
            }

            return response()->json($interns);

        } catch (\Throwable $e) {
            // Log full error
            Log::error('Intern filter error', [
                'user_id' => Auth::id(),
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'filters' => $request->all(),
            ]);

            if ($this->audit) {
                $this->audit->log(
                    'intern_filter_failed',
                    'Intern',
                    null,
                    ['filters' => $request->all(), 'error' => $e->getMessage()]
                );
            }

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while filtering interns.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
public function generateReport(Request $request)
{
  
    // -----------------------------
    // FETCH DATA
    // -----------------------------
    $interns = $this->interns->reportQuery($request);

    // -----------------------------
    // AUDIT LOG
    // -----------------------------
    if ($this->audit) {
        $this->audit->log(
            'interns_report_generated',  // event
            'Intern',                     // module/entity
            null,                         // target user (not specific)
            [
                'filters'       => $request->all(),
                'total_records' => $interns->count(),
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
    $pdf = Pdf::loadView('reports.interns', compact('interns', 'appName', 'appicon'))
               ->setPaper('a4', 'landscape')
               ->setOption('enable-local-file-access', true);

    return $pdf->download('interns-report-' . now()->format('Y-m-d') . '.pdf');
}

}
