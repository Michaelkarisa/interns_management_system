<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interns Report</title>
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
            border-bottom: 2px solid #0ea5e9;
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

        /* Badges */
        .badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 7px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-completed { background-color: #dcfce7; color: #16a34a; }
        .badge-inprogress { background-color: #dbeafe; color: #2563eb; }

        /* Performance Bar */
        .performance {
            display: inline-block;
            width: 40px;
            height: 10px;
            background-color: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            vertical-align: middle;
        }
        .performance-fill {
            height: 100%;
            background-color: #0ea5e9;
            display: block;
        }

        /* Recommendation */
        .recommend-yes { color: #16a34a; font-weight: bold; }
        .recommend-no { color: #ef4444; }

        /* Alignment */
        .text-center { text-align: center; }
        .text-right { text-align: right; }

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
                        <img src="{{ $appicon }}" alt="{{ $appName }} Logo" height="32" style="vertical-align: middle;">
                    @else
                        @if(file_exists(public_path('icon.svg')))
                            <img src="{{ public_path('icon.svg') }}" alt="Logo" height="32" style="vertical-align: middle;">
                        @elseif(file_exists(public_path('icon.png')))
                            <img src="{{ public_path('icon.png') }}" alt="Logo" height="32" style="vertical-align: middle;">
                        @endif
                    @endif
                    <span class="logo-text">
                        <span class="report-title">{{ $appName ?? 'InternTrack' }}</span>
                    </span>
                </td>
                <td style="width: 30%; text-align: right; font-size: 9px; color: #64748b;">
                    Interns Report
                </td>
            </tr>
        </table>
    </div>

    <!-- Content -->
    <div style="padding: 20px;">
        <div class="meta">
            Interns Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(array_filter(request()->all(), fn($v) => $v !== '' && $v !== false)))
                • Filters applied
            @endif
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th class="text-center">Performance</th>
                    <th class="text-center">Recommended</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                @forelse($interns as $intern)
                    <tr>
                        <td>{{ $intern->name }}</td>
                        <td>{{ $intern->institution ?? '—' }}</td>
                        <td>{{ $intern->position ?? '—' }}</td>
                        <td>
                            @php
                                $status = $intern->to ? 'Completed' : 'In Progress';
                                $badgeClass = $intern->to ? 'badge-completed' : 'badge-inprogress';
                            @endphp
                            <span class="badge {{ $badgeClass }}">{{ $status }}</span>
                        </td>
                        <td class="text-center">
                            <div class="performance">
                                <div class="performance-fill" style="width: {{ $intern->performance ?? 0 }}%;"></div>
                            </div>
                            <br>
                            <span style="font-size: 7px; color: #475569;">{{ $intern->performance ?? 0 }}%</span>
                        </td>
                        <td class="text-center">
                            @if($intern->recommended)
                                <span class="recommend-yes">Yes</span>
                            @else
                                <span class="recommend-no">No</span>
                            @endif
                        </td>
                        <td>{{ $intern->email }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="empty-cell">No interns to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Interns: {{ $interns->count() }} • Confidential – For Authorized Personnel Only
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