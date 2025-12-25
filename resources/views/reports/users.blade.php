<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Report</title>
    <style>
        @page {
            margin: 20mm 15mm;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 9px;
            color: #333;
            margin: 0;
            padding: 0;
            background: #fff;
            line-height: 1.4;
        }

        /* Header */
        .report-header {
            width: 100%;
            background: #f8fafc;
            border-bottom: 2px solid #7c2d12;
            padding: 15px 0;
        }
        table.header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table td {
            vertical-align: middle;
            padding: 0 20px;
        }
        .logo-text {
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
        }
        .report-title {
            font-size: 18px;
            color: #0f172a;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
        }

        /* Meta */
        .meta {
            font-size: 8px;
            color: #64748b;
            margin: 16px 0 12px 0;
            text-align: center;
        }

        /* Data Table */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .data-table th,
        .data-table td {
            padding: 6px 4px;
            text-align: left;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 8px;
        }
        .data-table th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #0f172a;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Role Badges */
        .role-badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 7px;
            font-weight: 600;
            text-transform: capitalize;
        }
        .role-super_admin { background-color: #f5f3ff; color: #7c2d12; }
        .role-admin { background-color: #dbeafe; color: #1d4ed8; }
        .role-user { background-color: #f1f5f9; color: #475569; }

        /* Status */
        .status-online { color: #16a34a; font-weight: bold; }
        .status-offline { color: #94a3b8; }

        /* Footer */
        .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
        }

        /* Empty State */
        .empty-cell {
            text-align: center;
            color: #94a3b8;
            padding: 12px !important;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="report-header">
        <table class="header-table">
            <tr>
                <td style="width: 70%;">
                    @if($appicon)
                        <img src="{{ $appicon }}" alt="{{ $appName }} Logo" height="36" style="vertical-align: middle;">
                    @else
                        @if(file_exists(public_path('icon.svg')))
                            <img src="{{ public_path('icon.svg') }}" alt="Logo" height="36" style="vertical-align: middle;">
                        @elseif(file_exists(public_path('icon.png')))
                            <img src="{{ public_path('icon.png') }}" alt="Logo" height="36" style="vertical-align: middle;">
                        @endif
                    @endif
                    <span class="logo-text">
                        <span class="report-title">{{ $appName ?? 'InternTrack' }}</span>
                    </span>
                </td>
                <td style="width: 30%; text-align: right; font-size: 9px; color: #64748b;">
                    Users Report
                </td>
            </tr>
        </table>
    </div>

    <!-- Content -->
    <div style="padding: 20px;">
        <div class="meta">
            Users Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(['search', 'role', 'status']))
                • Filters applied
            @endif
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($users as $user)
                    <tr>
                        <td>{{ $user->name }}</td>
                        <td>{{ $user->email }}</td>
                        <td>
                            @php
                                $roleClass = 'role-user';
                                if ($user->role === 'super_admin') $roleClass = 'role-super_admin';
                                elseif ($user->role === 'admin') $roleClass = 'role-admin';
                            @endphp
                            <span class="role-badge {{ $roleClass }}">{{ str_replace('_', ' ', $user->role) }}</span>
                        </td>
                        <td>
                            @if($user->is_online ?? false)
                                <span class="status-online">Online</span>
                            @else
                                <span class="status-offline">Offline</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="empty-cell">No users to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Users: {{ $users->count() }} • Confidential – For Authorized Personnel Only
        </div>
    </div>

    <!-- Page Numbers (DomPDF) -->
    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
            $font = null;
            $size = 8;
            $color = [0.5, 0.5, 0.5];
            $width = $pdf->get_width();
            $height = $pdf->get_height();
            $pdf->page_text($width / 2, $height - 20, $text, $font, $size, $color, 1, 'center');
        }
    </script>

</body>
</html>