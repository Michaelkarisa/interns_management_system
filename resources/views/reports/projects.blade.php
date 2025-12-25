<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intern Projects Report</title>
    <style>
        @page {
            margin: 15mm 10mm 20mm 10mm;
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
            border-bottom: 2px solid #0d9488;
            padding: 15px 0;
            page-break-after: avoid;
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
            page-break-after: avoid;
        }

        /* Data Table */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .data-table thead {
            display: table-header-group;
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
        .data-table tr {
            page-break-inside: avoid;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Text utilities */
        .text-right { text-align: right; }
        .text-wrap {
            word-wrap: break-word;
            word-break: break-word;
            max-width: 200px;
        }

        /* URL Link */
        .url-link {
            color: #0d9488;
            text-decoration: none;
            font-weight: 600;
            font-size: 8px;
        }

        /* Footer */
        .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            page-break-inside: avoid;
        }

        /* Empty state */
        .empty-cell {
            text-align: center;
            color: #94a3b8;
            padding: 12px !important;
        }

        /* Pagination – Web only */
        @media screen {
            .pagination {
                display: flex;
                justify-content: center;
                margin-top: 20px;
                gap: 5px;
            }
            .pagination a,
            .pagination span {
                padding: 5px 10px;
                border: 1px solid #e2e8f0;
                text-decoration: none;
                color: #0d9488;
                font-size: 10px;
            }
            .pagination .active {
                background-color: #0d9488;
                color: white;
            }
        }
        @media print {
            .pagination {
                display: none !important;
            }
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
                    Intern Projects Report
                </td>
            </tr>
        </table>
    </div>

    <!-- Content -->
    <div style="padding: 20px;">
        <div class="meta">
            Intern Projects Report • Generated on {{ now()->format('F j, Y \a\t g:i A') }}
            @if(request()->filled(array_filter(request()->all(), fn($v) => $v !== '' && $v !== false)))
                • Filters applied
            @endif
            @if(is_object($projects) && method_exists($projects, 'total'))
                • Total: {{ $projects->total() }} projects
            @else
                • Total: {{ $projects->count() }} projects
            @endif
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Project</th>
                    <th style="width: 30%;">Description</th>
                    <th style="width: 15%;">Impact</th>
                    <th style="width: 15%;">Intern(s)</th>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 13%;" class="text-right">URL</th>
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
                                <span class="url-link">Link</span>
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="empty-cell">No projects to display</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        @if(is_object($projects) && method_exists($projects, 'links'))
            <div class="pagination">
                {!! $projects->links() !!}
            </div>
        @endif

        <div class="footer">
            @if(is_object($projects) && method_exists($projects, 'total'))
                Showing {{ $projects->firstItem() }} to {{ $projects->lastItem() }} of {{ $projects->total() }} projects
            @else
                Total Projects: {{ $projects->count() }}
            @endif
            • Confidential – For Authorized Personnel Only
        </div>
    </div>

    <!-- Page Numbers (DomPDF) – Only if NOT paginated (i.e., full report) -->
    @if(!is_object($projects) || !method_exists($projects, 'links'))
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
    @endif

</body>
</html>