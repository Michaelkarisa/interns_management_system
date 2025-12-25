<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Logs Report</title>
    <style>
        @page {
            margin: 20mm 15mm;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10px;
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
            border-bottom: 2px solid #4f46e5;
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
            color: #1e293b;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
        }

        /* Meta */
        .meta {
            font-size: 9px;
            color: #64748b;
            margin: 16px 0 12px 0;
            text-align: center;
        }

        /* Data Table */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .data-table th,
        .data-table td {
            padding: 6px 4px;
            text-align: left;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 9px;
        }
        .data-table th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #1e293b;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Badges */
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

        /* Footer */
        .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
        }

        /* Empty state */
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
                    Audit Logs Report
                </td>
            </tr>
        </table>
    </div>

    <!-- Content -->
    <div style="padding: 20px;">
        <div class="meta">
            Audit Logs Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(['search', 'event', 'date_from', 'date_to']))
                • Filters applied
            @endif
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Event</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Date &amp; Time</th>
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
                        <td colspan="6" class="empty-cell">No audit logs to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Logs: {{ $logs->count() }} • Confidential – For Authorized Personnel Only
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