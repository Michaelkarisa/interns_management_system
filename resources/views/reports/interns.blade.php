<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interns Report</title>
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
            border-bottom: 2px solid #0ea5e9;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo {
            height: 32px;
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
        .badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 7px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-completed { background-color: #dcfce7; color: #16a34a; }
        .badge-inprogress { background-color: #dbeafe; color: #2563eb; }
        .performance {
            display: inline-block;
            width: 40px;
            height: 10px;
            background-color: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .performance-fill {
            height: 100%;
            background-color: #0ea5e9;
            display: block;
        }
        .recommend-yes { color: #16a34a; font-weight: bold; }
        .recommend-no { color: #ef4444; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
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
            Interns Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(array_filter(request()->all(), fn($v) => $v !== '' && $v !== false)))
                • Filters applied
            @endif
        </div>

        <table>
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
                                <div class="performance-fill" style="width: {{ $intern->performance ?? 0 }}%"></div>
                            </div>
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
                        <td colspan="7" style="text-align: center; color: #94a3b8;">No interns to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Interns: {{ $interns->count() }} • Confidential – For Authorized Personnel Only
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