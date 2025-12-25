<?php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\AuditLogService;
use App\Models\CompanyDetails;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{


    protected $audit;

    public function __construct(

        AuditLogService $auditService // optional structured logs
    ) {
        $this->audit    = $auditService;
    }
    public function index() {
    $company = CompanyDetails::first();
    return Inertia::render("Settings", [
        'activePath' => 'settings',
        'company'    => $company,
    ]);

    
}



  public function update(Request $request)
{
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'nullable|email',
        'phone'    => 'nullable|string|max:20',
        'website'  => 'nullable|string|max:255',
        'address'  => 'nullable|string|max:255',
        'tax_id'   => 'nullable|string|max:100',
        'industry' => 'nullable|string|max:100',
        'logo'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        'system_name' => 'nullable|string|max:200',
    ]);

    // Fetch or create company (assuming single company record)
    $company = CompanyDetails::first() ?? new CompanyDetails();
    $oldData = $company->toArray(); // For audit diff

    // If logo uploaded handle file storage
    if ($request->hasFile('logo')) {

        if ($company->logo_path && Storage::exists($company->logo_path)) {
            Storage::delete($company->logo_path);
        }

        $path = $request->file('logo')->store('company_logos', 'public');
        $validated['logo_path'] = $path;
    }

    // Update or create
    $company->fill($validated);
    $company->save();

    // Compute changes for audit logging
    $changes = [];
    foreach ($validated as $key => $value) {
        if (($oldData[$key] ?? null) !== $value) {
            $changes[$key] = [
                'old' => $oldData[$key] ?? null,
                'new' => $value,
            ];
        }
    }

    // Audit logging
    if ($this->audit) {
        $this->audit->log(
            'company_updated',
            'CompanyDetails',
            $company->id,
            $changes
        );
    }

    return response()->json([
        'message' => 'Company profile updated successfully!',
        'company' => $company,
    ], 200);
}


}