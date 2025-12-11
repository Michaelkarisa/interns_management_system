<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intern Projects Report</title>
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
            border-bottom: 2px solid #0d9488;
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
        .text-right { text-align: right; }
        .text-wrap {
            word-wrap: break-word;
            word-break: break-word;
        }
        .url-link {
            color: #0d9488;
            text-decoration: none;
            font-weight: 600;
            font-size: 8px;
        }
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
            Intern Projects Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(array_filter(request()->all(), fn($v) => $v !== '' && $v !== false)))
                • Filters applied
            @endif
        </div>

        <table>
            <thead>
                <tr>
                    <th>Project</th>
                    <th>Description</th>
                    <th>Impact</th>
                    <th>Intern(s)</th>
                    <th>Date</th>
                    <th class="text-right">URL</th>
                </tr>
            </thead>
            <tbody>
                @forelse($projects as $project)
                    <tr>
                        <td>{{ $project->title ?? '—' }}</td>
                        <td class="text-wrap">{{ $project->description ?? '—' }}</td>
                        <td>{{ $project->impact ?? '—' }}</td>
                        <td>
                            @php
                                $names = [];
                                if ($project->intern?->name) $names[] = $project->intern->name;
                                if ($project->team && $project->team->isNotEmpty()) {
                                    $names = array_merge($names, $project->team->pluck('name')->toArray());
                                }
                                echo implode(', ', array_unique($names)) ?: '—';
                            @endphp
                        </td>
                        <td>
                            @if($project->created_at)
                                {{ $project->created_at->format('M j, Y') }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-right">
                            @if($project->url)
                                <a href="{{ $project->url }}" class="url-link" target="_blank" rel="noopener">Link</a>
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; color: #94a3b8;">No projects to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            Total Projects: {{ $projects->count() }} • Confidential – For Authorized Personnel Only
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