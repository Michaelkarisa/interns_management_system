<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\CompanyDetails; // ← If you want icon from DB
use Illuminate\Support\Facades\Storage;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
{
    $company = CompanyDetails::first();

    $favicon = $company->appIcon; // fallback

    $appname = $company && $company->system_name 
        ? $company->system_name 
        : "InternTrack";

    return [
        ...parent::share($request),

        'auth' => [
            'user' => $request->user(),
            'appIcon' => $favicon,
            'appname' => $appname,
        ],

        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],

        'appIcon' => $favicon,
    ];
}

}
