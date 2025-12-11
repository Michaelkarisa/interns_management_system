<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add additional auth logic if needed
    }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'impact'      => 'nullable|string|max:2000',
            'url'         => 'nullable|url|max:255',
            'intern_id'   => 'required|string|exists:interns,id', // main owner of activity
            'team_members'=> 'nullable|array',
            'team_members.*' => 'string|exists:interns,id', // array of intern IDs
        ];
    }
}
