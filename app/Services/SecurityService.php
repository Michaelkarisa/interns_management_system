<?php
namespace App\Services;

use App\Models\Intern;
use App\Models\Activity;
use Illuminate\Pagination\LengthAwarePaginator;

class SecurityService
{
    public function sanitizeFilters(array $filters)
    {
        $clean = [];

        foreach ($filters as $key => $value) {
            if (is_null($value)) {
                $clean[$key] = null;
                continue;
            }

            // If value is an array, recursively sanitize
            if (is_array($value)) {
                $clean[$key] = $this->sanitizeFilters($value);
                continue;
            }

            // 1. Strip HTML tags
            $value = strip_tags($value);

            // 2. Remove malicious SQL keywords
            $value = preg_replace('/\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b/i', '', $value);

            // 3. Remove JavaScript event handlers
            $value = preg_replace('/on\w+=/i', '', $value);

            // 4. Remove script tags more aggressively
            $value = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $value);

            // 5. Block common XSS payloads
            $value = str_ireplace(['javascript:', 'vbscript:', 'data:text/html'], '', $value);

            // 6. Trim extra whitespace
            $value = trim($value);

            $clean[$key] = $value;
        }

        return $clean;
    }
}
