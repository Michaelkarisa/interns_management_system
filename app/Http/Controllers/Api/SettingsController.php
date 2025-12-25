<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use App\Models\CompanyDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    protected $audit;

    public function __construct(AuditLogService $auditService)
    {
        $this->audit = $auditService;
    }

    public function index()
    {
        try {
            $company = CompanyDetails::first();

            if ($this->audit) {
                $this->audit->log('settings_viewed', 'Settings', null);
            }

            $data = [
                'user' => [
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                ],
                'company' => $company
            ];

            return response()->json([
                'activePath' => 'settings',
                'data' => $data,
            ], 200);

        } catch (\Exception $e) {
            Log::error('SettingsController@index error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to load settings.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'nullable|email',
                'phone'    => 'nullable|string|max:20',
                'website'  => 'nullable|url|max:255',
                'address'  => 'nullable|string|max:255',
                'tax_id'   => 'nullable|string|max:100',
                'industry' => 'nullable|string|max:100',
                'logo'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'system_name' => 'nullable|string|max:255'
            ]);

            $company = CompanyDetails::first() ?? new CompanyDetails();
            $oldData = $company->toArray();

            if ($request->hasFile('logo')) {
                if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                    Storage::disk('public')->delete($company->logo_path);
                }
                $path = $request->file('logo')->store('company_logos', 'public');
                $validated['logo_path'] = $path;
            }

            $dataToSave = collect($validated)->except('logo')->toArray();
            if (isset($validated['logo_path'])) {
                $dataToSave['logo_path'] = $validated['logo_path'];
            }

            $company->fill($dataToSave);
            $company->save();

            // Compute changes for audit logging
            $changes = [];
            foreach ($dataToSave as $key => $value) {
                $oldValue = $oldData[$key] ?? null;
                if ($oldValue !== $value) {
                    $changes[$key] = ['old' => $oldValue, 'new' => $value];
                }
            }

            if ($this->audit && !empty($changes)) {
                $this->audit->log('company_updated', 'CompanyDetails', $company->id, $changes);
            }

            return response()->json([
                'message' => 'Company profile updated successfully!',
                'company' => $company,
            ], 200);

        } catch (\Exception $e) {
            Log::error('SettingsController@update error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update company profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . Auth::id(),
            ]);

            $user = Auth::user();
            $oldData = $user->toArray();
            $user->update($validated);

            $changes = [];
            foreach ($validated as $key => $value) {
                if (($oldData[$key] ?? null) !== $value) {
                    $changes[$key] = ['old' => $oldData[$key] ?? null, 'new' => $value];
                }
            }

            if ($this->audit && !empty($changes)) {
                $this->audit->log('profile_updated', 'User', $user->id, $changes);
            }

            return response()->json([
                'message' => 'Profile updated successfully!',
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('SettingsController@updateProfile error: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function company(){
        return response()->json([
            'data'=>CompanyDetails::first()
        ]);
    }
}
