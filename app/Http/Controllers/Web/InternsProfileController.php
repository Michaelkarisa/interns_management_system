<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Intern;
use App\Services\InternsService;
use App\Services\SecurityService;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreInternRequest;
use App\Http\Requests\UpdateInternRequest;
use Illuminate\Support\Facades\Storage;
// InternController.php
use Barryvdh\DomPDF\Facade\Pdf;
class InternsProfileController extends Controller
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

    public function index(string $id)
    {
        $data = $this->interns->getIntern($id);
    

        // Log view
        Log::info('Intern profile viewed', [
            'user_id'  => Auth::id(),
            'intern_id'=> $id,
        ]);

        if ($this->audit) {
            $this->audit->log(
                'intern_profile_viewed',
                'Intern',
                $id,
                []
            );
        }

        return Inertia::render('InternProfile', [
            'activePath' => 'interns',
            'data'       => $data,
        ]);
    }

   public function store(StoreInternRequest $request)
{
    try {
        $data = $request->validated();

        if ($request->hasFile('cv')) {
            $data['cv'] = $request->file('cv')->store('intern_cvs', 'public');
        }

        if ($request->hasFile('photo')) {
            $data['passport_photo'] = $request->file('photo')->store('intern_photos', 'public');
        }

        $filters = $this->security->sanitizeFilters($data);
        $intern  = $this->interns->create($filters);

        // Log creation
        Log::info('Intern created', [
            'user_id'   => Auth::id(),
            'intern_id' => $intern->id,
        ]);

        if ($this->audit) {
            $this->audit->log(
                'intern_created',
                'Intern',
                $intern->id,
                ['name' => $intern->name ?? null]
            );
        }

        return response()->json([
            'message' => 'success',
            'data'    => $intern
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating intern', [
            'message' => $e->getMessage(),
            'trace'   => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Failed to create intern',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


    public function update(UpdateInternRequest $request, string $id)
    {
        $data = $request->validated();

        if ($request->hasFile('cv')) {
            $data['cv'] = $request->file('cv')->store('intern_cvs', 'public');
        }

        if ($request->hasFile('photo')) {
            $data['passport_photo'] = $request->file('photo')->store('intern_photos', 'public');
        }

        $filters = $this->security->sanitizeFilters($data);
        $intern  = $this->interns->update($id, $filters);

        // Log update
        Log::info('Intern updated', [
            'user_id'  => Auth::id(),
            'intern_id'=> $id,
        ]);

        if ($this->audit) {
            $this->audit->log(
                'intern_updated',
                'Intern',
                $id,
                ['name' => $intern->name ?? null]
            );
        }

        return response()->json([
            'message' => 'updated',
            'data'    => $intern
        ]);
    }

    public function destroy(string $id)
    {
        $this->interns->delete($id);

        // Log deletion
        Log::info('Intern deleted', [
            'user_id'  => Auth::id(),
            'intern_id'=> $id,
        ]);

        if ($this->audit) {
            $this->audit->log(
                'intern_deleted',
                'Intern',
                $id,
                []
            );
        }

        return response()->json(['message' => 'deleted'], 200);
    }



public function generateProfileReport(string $id)
{
    $intern = $this->interns->getIntern($id);

    $pdf = Pdf::loadView('reports.intern-profile', [
        'intern' => $intern,
        'projects' => $intern->activities
    ])->setPaper('a4', 'portrait');
     if ($this->audit) {
            $this->audit->log(
                'intern_report_generated',
                'Intern',
                $intern->id,
                ['name' => $intern->name ?? null]
            );
        }
    return $pdf->download("intern-profile-{$intern->id}.pdf");
}
}
