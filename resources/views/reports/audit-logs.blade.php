<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Logs Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10px;
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
            border-bottom: 2px solid #4f46e5;
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
            color: #1e293b;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .meta {
            font-size: 9px;
            color: #64748b;
            margin-top: 4px;
            text-align: center;
        }
        .content {
            padding: 20px;
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
            color: #1e293b;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-login { background-color: #ede9fe; color: #7c3aed; }
        .badge-created { background-color: #dcfce7; color: #16a34a; }
        .badge-updated { background-color: #dbeafe; color: #2563eb; }
        .badge-deleted { background-color: #fee2e2; color: #dc2626; }
        .badge-default { background-color: #f1f5f9; color: #64748b; }
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
            Audit Logs Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(['search', 'event', 'date_from', 'date_to']))
                • Filters applied
            @endif
        </div>

        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Event</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                </tr>
            </thead>
            <tbody>
                @forelse($logs as $log)
                    <tr>
                        <td>{{ $log->user?->name ?? 'System' }}</td>
                        <td>
                            @php
                                $badgeClass = 'badge-default';
                                if (str_contains($log->event, 'login')) $badgeClass = 'badge-login';
                                elseif (str_contains($log->event, 'created')) $badgeClass = 'badge-created';
                                elseif (str_contains($log->event, 'updated')) $badgeClass = 'badge-updated';
                                elseif (str_contains($log->event, 'deleted')) $badgeClass = 'badge-deleted';
                            @endphp
                            <span class="badge {{ $badgeClass }}">{{ $log->event }}</span>
                        </td>
                        <td>{{ $log->entity_type ?? '-' }}</td>
                        <td>{{ $log->entity_id ?? '-' }}</td>
                        <td>{{ $log->created_at->format('M j, Y g:i A') }}</td>
                        <td>{{ $log->ip ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; color: #94a3b8;">No audit logs to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Logs: {{ $logs->count() }} • Confidential – For Authorized Personnel Only
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