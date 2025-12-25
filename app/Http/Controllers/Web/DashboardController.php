<?php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    protected $dashboard;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboard = $dashboardService;
    }

   public function index()
{
    $data = $this->dashboard->getDashboardStats();

    return Inertia::render("Dashboard", [
        "data" => $data,
        'activePath' => 'dashboard',
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ],
    ]);
}

}
