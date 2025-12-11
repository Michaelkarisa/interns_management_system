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
            line-height: 1.5;
            background: #fff;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #4f46e5;
        }
        .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo {
            height: 32px;
        }
        .report-title {
            font-size: 20px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
        }
        .profile-header {
            display: flex;
            gap: 20px;
            margin-bottom: 24px;
        }
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #475569;
            font-size: 24px;
            border: 2px solid #e2e8f0;
        }
        .profile-meta {
            flex: 1;
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
            display: flex;
            gap: 8px;
            margin-top: 8px;
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

        .card {
            background: #ffffff;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        .card-title {
            font-size: 12px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
        }
        .grid-item strong {
            color: #334155;
            font-weight: 600;
        }
        .grid-item span {
            color: #64748b;
            word-break: break-word;
        }

        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }
        .skill-tag {
            background: #ede9fe;
            color: #7c3aed;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        th, td {
            padding: 8px 6px;
            text-align: left;
            border: 1px solid #e2e8f0;
            font-size: 9px;
        }
        th {
            background-color: #f8fafc;
            font-weight: 700;
            color: #1e293b;
        }
        tr:nth-child(even) {
            background-color: #fafafa;
        }
        .text-wrap {
            word-wrap: break-word;
            word-break: break-word;
            max-width: 120px;
        }

        .notes-box {
            background: #f8fafc;
            border-left: 3px solid #4f46e5;
            padding: 12px;
            border-radius: 0 4px 4px 0;
            font-size: 9.5px;
            color: #334155;
            margin-top: 8px;
        }

        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
        }

        /* Page numbers */
        .page-number {
            position: fixed;
            bottom: 15px;
            right: 20px;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo-container">
            @if(file_exists(public_path('icon.svg')))
                <img src="{{ public_path('icon.svg') }}" alt="InternTrack" class="logo">
            @elseif(file_exists(public_path('icon.png')))
                <img src="{{ public_path('icon.svg') }}" alt="InternTrack" class="logo">
            @endif
            <div class="report-title">InternTrack</div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b;">
            Intern Profile Report<br>
            {{ now()->format('F j, Y') }}
        </div>
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
        @if($intern->passport_photo && file_exists(public_path(str_replace('/storage/', 'storage/', $intern->passport_photo))))
            <img src="{{ public_path(str_replace('/storage/', 'storage/', $intern->passport_photo)) }}" class="avatar" alt="Profile">
        @else
            <div class="avatar">{{ substr($intern->name, 0, 1) }}</div>
        @endif
        <div class="profile-meta">
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
        </div>
    </div>

    <!-- Internship Details -->
    <div class="card">
        <h2 class="card-title">Internship Details</h2>
        <div class="grid">
            <div class="grid-item"><strong>Institution:</strong> <span>{{ $intern->institution ?? '—' }}</span></div>
            <div class="grid-item"><strong>Department:</strong> <span>{{ $intern->department ?? '—' }}</span></div>
            <div class="grid-item"><strong>Course:</strong> <span>{{ $intern->course ?? '—' }}</span></div>
            <div class="grid-item"><strong>Start Date:</strong> <span>{{ $intern->from ? \Carbon\Carbon::parse($intern->from)->format('M j, Y') : '—' }}</span></div>
            <div class="grid-item"><strong>End Date:</strong> <span>{{ $intern->to ? \Carbon\Carbon::parse($intern->to)->format('M j, Y') : 'Present' }}</span></div>
            <div class="grid-item">
                <strong>Duration:</strong>
                <span>
                    @if($intern->from)
                        @php
                            $start = \Carbon\Carbon::parse($intern->from);
                            $end = $intern->to ? \Carbon\Carbon::parse($intern->to) : \Carbon\Carbon::now();
                            echo $start->diffInDays($end) . ' days';
                        @endphp
                    @else
                        —
                    @endif
                </span>
            </div>
            <div class="grid-item"><strong>Graduated:</strong> <span>{{ $intern->graduated ? 'Yes' : 'No' }}</span></div>
            <div class="grid-item"><strong>Supervisor:</strong> <span>{{ $intern->supervisor ?? '—' }}</span></div>
        </div>
    </div>

    <!-- Contact & Skills -->
    <div class="card">
        <h2 class="card-title">Contact & Skills</h2>
        <div class="grid">
            <div class="grid-item"><strong>Email:</strong> <span>{{ $intern->email ?? '—' }}</span></div>
            <div class="grid-item"><strong>Phone:</strong> <span>{{ $intern->phone ?? '—' }}</span></div>
        </div>
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

    <!-- Projects -->
    @if($projects && $projects->isNotEmpty())
        <div class="card">
            <h2 class="card-title">Projects</h2>
            <table>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Description</th>
                        <th>Impact</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($projects as $project)
                        <tr>
                            <td>{{ $project->title ?? '—' }}</td>
                            <td class="text-wrap">{{ $project->description ?? '—' }}</td>
                            <td>{{ $project->impact ?? '—' }}</td>
                            <td>{{ $project->created_at?->format('M j, Y') ?? '—' }}</td>
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

    <div class="footer">
        Confidential – For Authorized Personnel Only • InternTrack Internship Management System
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