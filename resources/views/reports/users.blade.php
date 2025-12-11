<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 9px;
            color: #333;
            margin: 0;
            padding: 0;
            background: #fff;
        }
        .report-header {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            background: #f8fafc;
            border-bottom: 2px solid #7c2d12;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo {
            height: 36px;
        }
        .report-title {
            font-size: 18px;
            color: #0f172a;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 20px;
        }
        .meta {
            font-size: 8px;
            color: #64748b;
            margin-bottom: 15px;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 6px 4px;
            text-align: left;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #0f172a;
            font-size: 8px;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
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
        .status-online { color: #16a34a; font-weight: bold; }
        .status-offline { color: #94a3b8; }
        .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <div class="header-left">
            <img src="{{ public_path('icon.svg') }}" alt="InternTrack Logo" class="logo">
            <div class="report-title">InternTrack</div>
        </div>
    </div>

    <div class="content">
        <div class="meta">
            Users Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(['search', 'role', 'status']))
                • Filters applied
            @endif
        </div>

        <table>
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
                        <td colspan="4" style="text-align: center; color: #94a3b8;">No users to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Users: {{ $users->count() }} • Confidential – For Authorized Personnel Only
        </div>
    </div>

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