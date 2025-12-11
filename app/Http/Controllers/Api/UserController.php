<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SecurityService;
use App\Services\UserService;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Barryvdh\DomPDF\Facade\Pdf;
class UserController extends Controller
{
    protected $userService;
    protected $security;
    protected $audit;

    public function __construct(
        UserService $userService,
        SecurityService $securityService,
        AuditLogService $auditService // optional structured logging
    ) {
        $this->userService = $userService;
        $this->security    = $securityService;
        $this->audit       = $auditService;
    }

    public function index()
    {
        $data = $this->userService->getUsers([], 15, 0);

        // Log view
        Log::info('Users list viewed', ['user_id' => Auth::id(), 'count' => count($data)]);

        if ($this->audit) {
            $this->audit->log(
                'users_list_viewed',
                'User',
                null,
                ['count' => count($data)]
            );
        }

        return Inertia::render("UsersList", [
            'activePath' => 'users',
            'data'       => $data,
        ]);
    }

    public function promoteToAdmin(string $id)
    {
        $user = $this->userService->promoteToAdmin($id);

        // Log promotion
        Log::info('User promoted to admin', ['user_id' => Auth::id(), 'target_user_id' => $id]);

        if ($this->audit) {
            $this->audit->log(
                'user_promoted_to_admin',
                'User',
                $id,
                ['name' => $user->name]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} promoted to admin."
        ]);
    }

    public function demoteToUser(string $id)
    {
        $user = $this->userService->demoteToUser($id);

        // Log demotion
        Log::info('User demoted to regular user', ['user_id' => Auth::id(), 'target_user_id' => $id]);

        if ($this->audit) {
            $this->audit->log(
                'user_demoted_to_user',
                'User',
                $id,
                ['name' => $user->name]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} demoted to regular user."
        ]);
    }

    public function filter(Request $request)
    {
        $rawFilters = [
            'search' => $request->input('search'),
            'role'   => $request->input('role'),
            'status' => $request->input('status'),
        ];

        $filters = $this->security->sanitizeFilters($rawFilters);

        $page    = $request->input('page', 1);
        $perPage = $request->input('per_page', 15);

        $users = $this->userService->getUsers($filters, $perPage, $page);

        // Log filter action
        Log::info('User filter applied', ['user_id' => Auth::id(), 'filters' => $filters]);

        if ($this->audit) {
            $this->audit->log(
                'user_filter_applied',
                'User',
                null,
                ['filters' => $filters]
            );
        }

        return response()->json($users);
    }

  public function store(Request $request): JsonResponse
{
    try {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $filters = $this->security->sanitizeFilters($request->all());

        $user = $this->userService->create($filters);

        // Audit successful creation
        if (isset($this->audit)) {
            $this->audit->log(
                'user_created',
                'User',
                $user->id,
                [
                    'name'  => $user->name,
                    'email' => $user->email,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Failed to create user.',
            'data'   => $user,
        ], 200);;
        
    } catch (\Throwable $e) {
        // Audit the error
          \Log::error('User creation failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'payload' => $request->all(),
        ]);

        if (isset($this->audit)) {
            $this->audit->log(
                'user_creation_failed',
                'User',
                null,
                [
                    'input'   => $request->all(),
                    'message' => $e->getMessage(),
                    'trace'   => $e->getTraceAsString(),
                ]
            );
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to create user.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


// app/Http/Controllers/UserController.php



public function generateReport(Request $request)
{
 
    $users = $this->userService->reportQuery($request);

    /**
     * -----------------------------------------------------
     * 🔐 AUDIT LOG — Report Generated
     * -----------------------------------------------------
     */
    if ($this->audit) {
        $this->audit->log(
            'users_report_generated',   // event
            'User',                     // module/entity
            null,                       // target user (not specific)
            [
                'filters'       => $request->all(),
                'total_records' => $users->count(),
                'generated_by'  => Auth::id(),
            ]
        );
    }

    /**
     * -----------------------------------------------------
     * 📄 Generate the PDF
     * -----------------------------------------------------
     */
    $pdf = Pdf::loadView('reports.users', compact('users'))
               ->setPaper('a4', 'portrait');

    return $pdf->download('users-report-' . now()->format('Y-m-d') . '.pdf');
}

}
