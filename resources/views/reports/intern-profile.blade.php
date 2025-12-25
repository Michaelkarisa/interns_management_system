<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $intern->name }} – Intern Profile</title>
    <style>
        @page {
            margin: 25mm 15mm;
        }
        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.4;
            background: #fff;
            margin: 0;
            padding: 0;
        }

        /* Header */
        .header {
            width: 100%;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #4f46e5;
        }
        table.full-width {
            width: 100%;
            border-collapse: collapse;
        }
        .header td {
            vertical-align: middle;
            padding: 0;
        }
        .logo-text {
            display: inline-block;
            vertical-align: middle;
            margin-left: 8px;
        }
        .report-title {
            font-size: 20px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .header-date {
            font-size: 10px;
            color: #64748b;
            text-align: right;
            line-height: 1.3;
        }

        /* Profile Section */
        .profile-section {
            width: 100%;
            margin-bottom: 24px;
        }
        .avatar-cell {
            width: 90px;
            padding-right: 16px;
            vertical-align: top;
        }
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            font-size: 24px;
            border: 2px solid #e2e8f0;
            text-align: center;
            line-height: 60px;
        }
        .profile-meta-cell {
            vertical-align: top;
        }
        .name {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 4px 0;
        }
        .position {
            font-size: 11px;
            color: #64748b;
            margin: 0 0 10px 0;
        }
        .badges {
            display: inline-flex;
            gap: 8px;
            margin-top: 6px;
            flex-wrap: wrap;
        }
        .badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-recommended { background: #dcfce7; color: #16a34a; }
        .badge-not-recommended { background: #fee2e2; color: #dc2626; }
        .badge-performance {
            background: linear-gradient(90deg, #ede9fe 0%, #ddd6fe 100%);
            color: #7c2d12;
        }

        /* Card */
        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .card-title {
            font-size: 12px;
            font-weight: 700;
            color: #4f46e5;
            margin: 0 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
        }

        /* Details Table */
        table.details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        .details-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .details-label {
            width: 160px;
            color: #334155;
            font-weight: 600;
            padding-right: 12px;
        }
        .details-value {
            color: #64748b;
            word-break: break-word;
        }

        /* Two-column row for Internship + Contact */
        table.row-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .row-table td {
            width: 50%;
            padding-right: 10px;
            vertical-align: top;
        }

        /* Skills */
        .skills {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .skill-tag {
            background: #ede9fe;
            color: #7c3aed;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 600;
            white-space: nowrap;
        }

        /* Projects Table */
        table.projects-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .projects-table th,
        .projects-table td {
            padding: 8px 6px;
            text-align: left;
            border: 1px solid #e2e8f0;
            font-size: 9px;
            vertical-align: top;
        }
        .projects-table th {
            background-color: #f8fafc;
            font-weight: 700;
            color: #1e293b;
        }
        .projects-table tr:nth-child(even) {
            background-color: #fafafa;
        }
        .text-wrap {
            word-wrap: break-word;
            word-break: break-word;
            min-width: 80px;
            max-width: 200px;
        }
        .text-right { text-align: right; }

        /* Notes */
        .notes-box {
            background: #f8fafc;
            border-left: 3px solid #4f46e5;
            padding: 12px;
            border-radius: 0 4px 4px 0;
            font-size: 9.5px;
            color: #334155;
            margin-top: 8px;
            white-space: pre-wrap;
        }

        /* Footer */
        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <table class="full-width">
            <tr>
                <td style="width: 70%; vertical-align: middle;">
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
                <td style="width: 30%; text-align: right; vertical-align: middle;" class="header-date">
                    Intern Profile Report<br>
                    {{ now()->format('F j, Y') }}
                </td>
            </tr>
        </table>
    </div>

    <!-- Profile Header -->
    <table class="full-width profile-section">
        <tr>
            <td class="avatar-cell">
                @if($intern->passport_photo && file_exists(public_path(str_replace('/storage/', 'storage/', $intern->passport_photo))))
                    <img src="{{ public_path(str_replace('/storage/', 'storage/', $intern->passport_photo)) }}" class="avatar" alt="Profile">
                @else
                    <div class="avatar">{{ strtoupper(substr($intern->name, 0, 1)) }}</div>
                @endif
            </td>
            <td class="profile-meta-cell">
                <h1 class="name">{{ $intern->name }}</h1>
                <p class="position">{{ $intern->position ?? 'Intern' }}</p>
                <div class="badges">
                    <span class="badge {{ $intern->recommended ? 'badge-recommended' : 'badge-not-recommended' }}">
                        {{ $intern->recommended ? 'Recommended' : 'Not Recommended' }}
                    </span>
                    <span class="badge badge-performance">
                        Performance: {{ $intern->performance ?? 0 }}/100
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Internship Details + Contact & Skills in one row -->
    <table class="row-table">
        <tr>
            <!-- Internship Details -->
            <td>
                <div class="card">
                    <h2 class="card-title">Internship Details</h2>
                    <table class="details-table">
                        <tr><td class="details-label">Institution:</td><td class="details-value">{{ $intern->institution ?? '—' }}</td></tr>
                        <tr><td class="details-label">Department:</td><td class="details-value">{{ $intern->department ?? '—' }}</td></tr>
                        <tr><td class="details-label">Course:</td><td class="details-value">{{ $intern->course ?? '—' }}</td></tr>
                        <tr><td class="details-label">Start Date:</td><td class="details-value">{{ $intern->from ? \Carbon\Carbon::parse($intern->from)->format('M j, Y') : '—' }}</td></tr>
                        <tr><td class="details-label">End Date:</td><td class="details-value">{{ $intern->to ? \Carbon\Carbon::parse($intern->to)->format('M j, Y') : 'Present' }}</td></tr>
                        <tr>
                            <td class="details-label">Duration:</td>
                            <td class="details-value">
                                @if($intern->from)
                                    @php
                                        $start = \Carbon\Carbon::parse($intern->from);
                                        $end = $intern->to ? \Carbon\Carbon::parse($intern->to) : \Carbon\Carbon::now();
                                        echo $start->diffInDays($end) . ' days';
                                    @endphp
                                @else
                                    —
                                @endif
                            </td>
                        </tr>
                        <tr><td class="details-label">Graduated:</td><td class="details-value">{{ $intern->graduated ? 'Yes' : 'No' }}</td></tr>
                    </table>
                </div>
            </td>

            <!-- Contact & Skills -->
            <td>
                <div class="card">
                    <h2 class="card-title">Contact & Skills</h2>
                    <table class="details-table">
                        <tr><td class="details-label">Email:</td><td class="details-value">{{ $intern->email ?? '—' }}</td></tr>
                        <tr><td class="details-label">Phone:</td><td class="details-value">{{ $intern->phone ?? '—' }}</td></tr>
                    </table>
                    <div class="skills">
                        @if($intern->skills && count($intern->skills) > 0)
                            @foreach($intern->skills as $skill)
                                <span class="skill-tag">{{ $skill }}</span>
                            @endforeach
                        @else
                            <span class="skill-tag">No skills listed</span>
                        @endif
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Projects -->
    @if($projects && $projects->isNotEmpty())
        <div class="card">
            <h2 class="card-title">Projects</h2>
            <table class="projects-table">
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
                    @foreach($projects as $project)
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
                                    <span style="color: #0d9488; font-weight: 600; font-size: 8px;">Link</span>
                                @else
                                    —
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    <!-- Performance Notes -->
    @if($intern->notes)
        <div class="card">
            <h2 class="card-title">Performance Notes</h2>
            <div class="notes-box">{{ $intern->notes }}</div>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        Confidential – For Authorized Personnel Only • {{ $appName ?? 'InternTrack Internship Management System' }}
    </div>

    <!-- Page Numbers (DomPDF) -->
    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
            $font = null;
            $size = 8;
            $color = [0.6, 0.6, 0.6];
            $width = $pdf->get_width();
            $height = $pdf->get_height();
            $pdf->page_text($width - 50, $height - 20, $text, $font, $size, $color);
        }
    </script>

</body>
</html>